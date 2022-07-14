import {PartialPage} from "../core/BasePage";
import {pageFunc} from "../PageBuilder";
import {Player} from "../../../modules/player/data/Player";
import {pageMgr} from "../../../modules/core/managers/PageManager";
import {BaseData} from "../../../modules/core/data/BaseData";
import {field} from "../../../modules/core/data/DataLoader";
import {modal} from "../../../modules/core/BaseAssist";
import {playerMgr} from "../../../modules/player/managers/PlayerManager";
import {alertMgr} from "../../../modules/core/managers/AlertManager";
import {waitForDataLoad} from "../../../modules/core/managers/DataManager";
import {LoginPage} from "../../login/LoginPage";

const JudgeLogin = modal("请登录", "登录后才能进入小程序哦~");

class Data extends BaseData {
	@field(Player)
	player: Player
}

const DefaultLoginThrow = "请登录后再进行操作！";

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

	public get openid() { return this.player?.openid }
	public get player() { return this.data.player; }

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
		let userInfo = await playerMgr().login();

		if (!userInfo && this.forceLogin) {
			const res = await alertMgr().showAlert(JudgeLogin);

			// TODO: 补充登录页
			if (res.confirm) await pageMgr().goto(LoginPage);
			if (res.cancel) await pageMgr().pop();

		} else if (userInfo && refresh)
			userInfo = await playerMgr().refresh();

		return userInfo;
	}

	public async manualLogin(desc?: string) {
		this.setPlayer(await playerMgr().manualLogin(desc))
	}

	public async refresh() {
		this.setPlayer(await playerMgr().refresh())
	}

	private setPlayer(player: Player) {
		const oriPlayer = this.player
		this.setData({ player });

		if (oriPlayer != player)
			this.onLogin.forEach(f => f());
	}

	public resetPlayer() {
		this.setPlayer(this.player);
	}

	public registerOnLogin(func: Function) {
		this.onLogin.push(func);
	}

	/**
	 * 确保登陆
	 */
	public ensureLogin(throw_?: Function | string) {
		if (throw_ == undefined) throw_ = DefaultLoginThrow;

		if (!this.player)
			if (throw_ instanceof Function) throw_();
			else throw throw_;
	}
}
