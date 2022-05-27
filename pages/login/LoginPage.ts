import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {field} from "../../modules/core/data/DataLoader";
import {PlayerState} from "../../modules/player/data/Player";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {MainPage} from "../main/MainPage";

const LoginDesc = "个人信息仅用于展示";

class Data extends BasePageData {

	@field
	isLogin: boolean = false;
	@field
	isNewer: boolean = false;
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

	onLogin() {
		this.setData({ isLogin: true });
		const player = this.playerPage.userInfo;
		if (player.state == PlayerState.Newer) // 如果是新人
			this.setData({ isNewer: true });
		else
			pageMgr().goto(MainPage);
	}

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
			userInfo: this.playerPage.userInfo
		});
	}

	// endregion

}
