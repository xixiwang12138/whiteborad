import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr, waitForLogin} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {field} from "../../modules/core/data/DataLoader";
import {RoomDrawingPage, RoomPage} from "../common/partPages/RoomPage";
import {Room} from "../../modules/room/data/Room";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {waitForDataLoad} from "../../modules/core/managers/DataManager";
import {RoomSkin, roomSkinRepo} from "../../modules/room/data/RoomSkin";
import {Motion, motionRepo} from "../../modules/room/data/Motion";
import {PlayerRoom} from "../../modules/room/data/PlayerRoom";
import {handleError} from "../../modules/core/managers/ErrorManager";
import {alertMgr} from "../../modules/core/managers/AlertManager";
import {showLoading} from "../../modules/core/managers/LoadingManager";
import {ThemePage} from "../common/partPages/ThemePage";
import {PlayerMotion} from "../../modules/room/data/PlayerMotion";

const RoomPosition = [0.5, 0.3];
const RoomScale = 0.9;

class Data extends BasePageData {

	@field(Room)
	room: Room

	@field([RoomSkin])
	skins: RoomSkin[] = []
	@field([Motion])
	motions: Motion[] = []

	@field(PlayerRoom)
	playerRoom: PlayerRoom

	@field(PlayerMotion)
	playerMotion: PlayerMotion

	@field(Number)
	tab: number = 1

	@field(Number)
	curSkinId: number

	@field
	showBuyButton: boolean = false;

}

@page("shop", "商城")
export class ShopPage extends BasePage<Data>{

	public data = new Data();

	public playerPage = new PlayerPage();
	public roomPage = new RoomPage();
	public roomDrawingPage = new RoomDrawingPage();
	public themePage = new ThemePage();

	// region 数据访问

	public get room() { return this.data.room }

	// endregion

	async onLoad(e) {
		await super.onLoad(e);
		await this.initialize();
	}

	@waitForLogin
	@waitForDataLoad
	private async initialize() {
		await this.loadRoom();
		await this.loadData();
		await this.refresh();
	}
	private async loadData() {
		const skins = roomSkinRepo().list;
		const motions = motionRepo().list;

		const playerRoom = await playerMgr().getData(PlayerRoom);
		//TODO 用playerData获取playerMotion
		const playerMotion = await roomMgr().getPlayerMotion();

		await this.setData({skins, motions, playerRoom, playerMotion});
	}
	private async loadRoom() {
		const room = await roomMgr().getSelfRoom();
		await this.setData({room: room.clone()});
	}

	// region 操作

	public async selectSkin(skinId) {
		const skin = roomSkinRepo().getById(skinId);
		if (!skin.isUnlock) return; // 未解锁，无法预览

		await this.setData({
			curSkinId: this.room.skinId = skinId,
			showBuyButton: !skin.isBought
		});
		if (skin.isBought) // 已经购买了，直接切换
			await roomMgr().switchSkin(skinId);
		await this.refresh();
	}

	public async receiveMotionReward(motionId){
		const records = (await roomMgr().getPlayerMotion()).records
		const playerMotionRecord = records.find(pm => pm.motionId == motionId);

		if(!playerMotionRecord)return;		//未解锁,无法获取奖励
		if(playerMotionRecord.rewardTime != undefined)return;	//已领取，无法获取奖励
		await roomMgr().receiveMotionReward(motionId);
	}

	// endregion

	// region 事件

	/**
	 * 选择一个皮肤
	 */
	@pageFunc
	public async onSkinTap(e) {
		await this.selectSkin(Number(e.currentTarget.dataset.id))
	}

	/**
	 * Tab页面切换
	 */
	@pageFunc
	public onSkinTab(){
		this.setData({ tab: 1 })
	}
	@pageFunc
	public onMotionTab(){
		this.setData({ tab: 2 })
	}

	@pageFunc
	@handleError
	@showLoading
	public async onBuyTap() {
		const skinId = this.data.curSkinId;
		await roomMgr().buySkin(skinId);
		await roomMgr().switchSkin(skinId);
		await this.playerPage.resetPlayer();
		await this.refresh();
		await this.setData({
			showBuyButton: false
		});
		await alertMgr().showToast("购买成功", "success");
	}

	@pageFunc
	@handleError
	@showLoading
	public async onMotionTap(e) {
		const motion = e.currentTarget.dataset.motion
		if(!motion.isUnlock)return;
		if(!motion.isUnclaimed)return;

		const motionId = e.currentTarget.dataset.motion.id;
		await this.receiveMotionReward(motionId)
		await this.setData({motions: this.data.motions});
		await alertMgr().showToast("奖励领取成功", "success");
	}

	// endregion

	// region 更新

	update() {
		super.update();
		this.roomDrawingPage.update();
	}

	// endregion

	// region 绘制

	@showLoading
	public async refresh() {
		await this.roomDrawingPage.draw(this.room, RoomPosition, RoomScale);
		await this.setData({ skins: this.data.skins })
	}

	// endregion
}

