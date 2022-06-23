import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {field} from "../../modules/core/data/DataLoader";
import {PlayerEditableInfo, PlayerState} from "../../modules/player/data/Player";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {input} from "../common/utils/PageUtils";

const LoginDesc = "个人信息仅用于展示";

class Data extends BasePageData {

	@field
	info: PlayerEditableInfo = {};
	@field
	isLogin: boolean = false;
	@field
	isNewer: boolean = false;
	// @field(String)
	// name: string = "";
}

@page("login", "登陆")
export class LoginPage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();

	onReady() {
		super.onReady();
		this.playerPage.registerOnLogin(
			() => this.onLogin())
	}

	// region 事件

	async onLogin() {
		const player = this.playerPage.player;
		await this.setData({
			info: {
				name: player.name,
				slogan: player.slogan,
				gender: player.gender,
				avatarUrl: player.avatarUrl
			},
			isLogin: true
		});
		// 如果是新人
		if (player.state == PlayerState.Newer) {
			await this.setData({ isNewer: true });
			await this.processInvite();
		} else await pageMgr().goto(MainPage);
	}

	private async processInvite() {
		const inviteCode = this.getExtra("code");
		if (inviteCode) await playerMgr().invitePlayer(inviteCode);
	}

	// region 页面事件

	@pageFunc
	onMaleTap() {
		this.setData({ "info.gender": 1 });
	}
	@pageFunc
	onFemaleTap() {
		this.setData({ "info.gender": 2 });
	}

	@pageFunc
	@input("info.name")
	onNameInput() {}

	@pageFunc
	@input("info.slogan")
	onSloganInput() {}

	@pageFunc
	public tapToLogin() {
		this.playerPage.manualLogin(LoginDesc).then();
	}

	@pageFunc
	public async getPhoneNumber(e) {
		console.log(e.detail.code)
		if (!e.detail.code) return;
		// getPhone函数返回值
		await playerMgr().getPhone(e.detail.code)
		await this.playerPage.setData({
			userInfo: this.playerPage.player
		});
	}

	@pageFunc
	public async onSubmit() {
		await playerMgr().editInfo(this.data.info);
		await pageMgr().goto(MainPage);
	}

	// endregion

	// endregion

}

import {MainPage} from "../main/MainPage";
