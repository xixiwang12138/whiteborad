import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";

const LoginDesc = "个人信息仅用于展示";
const isLogin=false;
class Data extends BasePageData {}


@page("login", "登陆")
export class LoginPage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	 public playerPage: PlayerPage = new PlayerPage();

	//测试登陆事件
	@pageFunc
 public login(){
	this.setData({
		isLogin:true
	})
}

	// region 事件

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
