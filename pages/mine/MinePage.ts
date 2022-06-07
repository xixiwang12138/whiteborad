import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr, waitForLogin} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {field} from "../../modules/core/data/DataLoader";
import {PlayerEditableInfo, PlayerState} from "../../modules/player/data/Player";
import {input} from "../common/utils/PageUtils";
import {RoomPage} from "../common/partPages/RoomPage";
class Data extends BasePageData {

	@field(Array)
	collectedRooms = [{
		userName: "测试君", level: 3, name: "摆烂12小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	}];
	@field
	info: PlayerEditableInfo = {};
	@field
	isEdit = false;

}

@page("mine", "我的")
export class MinePage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();
	public roomPage: RoomPage = new RoomPage();

	async onReady() {
		super.onReady();
		await this.onLogin();
	}

	@waitForLogin
	async onLogin() {
		const player = this.playerPage.player;
		// await this.roomPage.loadSelfRoom();
		await this.setData({
			info: {
				name: player.name,
				slogan: player.slogan,
				gender: player.gender,
				avatarUrl: player.avatarUrl
			},
		});
	}

	// region 事件

	@pageFunc
  public onAvatarTap(){
    this.setData({ isEdit: true }).then()
	}

  @pageFunc
  public onClose(){
		this.setData({ isEdit: false }).then()
	 }

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
	 public async onSubmit() {
		const player = this.playerPage.player;
		 await playerMgr().editInfo(this.data.info);
		 this.setData({
			 isEdit:false,
		 }),
		 this.playerPage.resetPlayer()
	 }
}
