import {PartialPage} from "../core/BasePage";
import {pageFunc} from "../PageBuilder";
import {Player} from "../../../modules/user/data/User";
import {pageMgr} from "../../../modules/core/managers/PageManager";
import {BaseData} from "../../../modules/core/data/BaseData";
import {field} from "../../../modules/core/data/DataLoader";
import {modal} from "../../../modules/core/BaseAssist";
import {userMgr} from "../../../modules/user/managers/UserManager";
import {alertMgr} from "../../../modules/core/managers/AlertManager";
import {waitForDataLoad} from "../../../modules/core/managers/DataManager";

const JudgeLogin = modal("请登录", "登录后才能进入小程序哦~");

class Data extends BaseData {
	@field(Player)
	player: Player
}

// export function needIdentAuth(obj, key, desc) {
// 	if (obj.constructor != AuthPage)
// 		throw "needIdentAuth修饰器仅用于UserPageWithAuth类的实例"
//
// 	const oriFunc = desc.value;
// 	desc.value = function (...p) {
// 		if (this.userInfo().isIdentAuthed())
// 			oriFunc.apply(this, p);
// 		else this.onNotIdentAuthed();
// 	}
// }
//
// export function needCertAuth(...types: RoleType[]) {
// 	return (obj, key, desc) => {
// 		if (obj.constructor != AuthPage)
// 			throw "needCertAuth修饰器仅用于AuthPage类的实例"
//
// 		const oriFunc = desc.value;
// 		desc.value = function (...p) {
// 			if (types.includes(this.userInfo().role().type))
// 				oriFunc.apply(this, p);
// 			else this.onNotCertAuthed();
// 		}
// 	}
// }

const DefaultLoginThrow = "请登录后再进行操作！";
const DefaultIdentThrow = "请个人认证后再进行操作！";
const DefaultCertThrow = "请资质认证后再进行操作！";
const DefaultRoleThrow = "您无权进行该操作！";

// export function ensureLogin(throw_?: Function | string) {
// 	return (obj, key, desc) => {
// 		const oriFunc = desc.value;
// 		desc.value = function (...p) {
// 			const userPage: UserPage = this.userPage;
// 			if (!userPage || !(userPage instanceof UserPage)) {
// 				console.error("该页面没有添加UserPage!"); return;
// 			}
// 			userPage.ensureLogin(throw_);
// 			return oriFunc.apply(this, p);
// 		}
// 	}
// }
//
// export function ensureRole(typeOrTypes: RoleType[] | RoleType, throw_?: Function | string) {
// 	return (obj, key, desc) => {
// 		const oriFunc = desc.value;
// 		desc.value = function (...p) {
// 			const userPage: AuthPage = this.userPage;
// 			if (!userPage || !(userPage instanceof AuthPage)) {
// 				console.error("该页面没有添加AuthPage!"); return;
// 			}
// 			userPage.ensureRole(typeOrTypes, throw_);
// 			return oriFunc.apply(this, p);
// 		}
// 	}
// }

/**
 * 封装了用户功能的页面
 */
export class PlayerPage extends PartialPage<Data> {

	public data = new Data();

	private readonly useRefresh: boolean;
	private readonly forceLogin: boolean;

	/**
	 * 构造函数
	 * @param useRefresh 是否重新获取个人数据
	 * @param forceLogin 是否强制要求登陆
	 */
	constructor(useRefresh: boolean = true,
							forceLogin: boolean = false) {
		super();
		this.useRefresh = useRefresh;
		this.forceLogin = forceLogin;
	}

	public onLogin: Function[] = [];

	public get openid() { return this.userInfo?._id }
	public get userInfo() { return this.data.player; }

	@pageFunc
	public onShow() {
		this.loadUser().then();
		// this.registerOnLogin(() => this.checkPhone());
	}

	@waitForDataLoad
	public async loadUser() {
		this.setPlayer(await this.autoLogin(this.useRefresh));
	}

	// @waitForLogin
	// private checkPhone() {
	//
	// }

	// @pageFunc
	// public getPhoneNumber(e) {
	// 	console.log(e)
	// }

	public async autoLogin(refresh: boolean = false) {
		let userInfo = await userMgr().login();

		if (!userInfo && this.forceLogin) {
			const res = await alertMgr().showAlert(JudgeLogin);

			// TODO: 补充登录页
			if (res.confirm) await pageMgr().goto(undefined);
			if (res.cancel) await pageMgr().pop();

		} else if (userInfo && refresh)
			userInfo = await userMgr().refresh();

		return userInfo;
	}

	public async manualLogin(desc?: string) {
		this.setPlayer(await userMgr().manualLogin(desc))
	}

	public async refresh() {
		this.setPlayer(await userMgr().refresh())
	}

	private setPlayer(player: Player) {
		this.setData({ player });
		this.onLogin.forEach(f => f());
	}

	public registerOnLogin(func: Function) {
		this.onLogin.push(func);
	}

	/**
	 * 确保登陆
	 */
	public ensureLogin(throw_?: Function | string) {
		if (throw_ == undefined) throw_ = DefaultLoginThrow;

		if (!this.userInfo)
			if (throw_ instanceof Function) throw_();
			else throw throw_;
	}
}
