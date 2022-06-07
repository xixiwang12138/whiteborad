import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr, waitForLogin} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {field} from "../../modules/core/data/DataLoader";
import {RoomDrawingPage} from "../common/partPages/RoomPage";
import {ItemDetailPage} from "../common/pages/ItemDetailPage";
import {Room} from "../../modules/room/data/Room";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {waitForDataLoad} from "../../modules/core/managers/DataManager";
import {RoomSkin, roomSkinRepo} from "../../modules/room/data/RoomSkin";
import {Motion, motionRepo} from "../../modules/room/data/Motion";
import {PlayerRoom} from "../../modules/room/data/PlayerRoom";
import {handleError} from "../../modules/core/managers/ErrorManager";
import {alertMgr} from "../../modules/core/managers/AlertManager";

const RoomPosition = [0.5, 0.3];
const RoomScale = 0.9;

class Data extends BasePageData {

	@field(Room)
	item: Room

	@field([RoomSkin])
	skins: RoomSkin[] = []
	@field([Motion])
	motions: Motion[] = []

	@field(PlayerRoom)
	playerRoom: PlayerRoom

	@field(Number)
	tab: number = 1

	@field(Number)
	curSkinId: number

	@field
	showBuyButton: boolean = false;

}

@page("shop", "商城")
export class ShopPage extends ItemDetailPage<Data, Room>{

	public data = new Data();

	public playerPage: PlayerPage = new PlayerPage();
	public roomDrawingPage: RoomDrawingPage = new RoomDrawingPage();

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
		const playerRoom = playerMgr().getData(PlayerRoom);
		await this.setData({skins, motions, playerRoom});
	}
	private async loadRoom() {
		const room = await roomMgr().getSelfRoom();
		await this.setItem(room.clone());
	}

	// region 操作

	public async selectSkin(skinId) {
		const skin = roomSkinRepo().getById(skinId);
		if (!skin.isUnlock) return; // 未解锁，无法预览

		await this.setData({
			curSkinId: this.item.skinId = skinId,
			showBuyButton: !skin.isBought
		});
		if (skin.isBought) // 已经购买了，直接切换
			await roomMgr().switchSkin(skinId);
		await this.refresh();
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

	// endregion

	// region 更新

	update() {
		super.update();
		this.roomDrawingPage.update();
	}

	// endregion

	// region 绘制

	public async refresh() {
		await this.roomDrawingPage.draw(
			this.item, RoomPosition, RoomScale);
		await this.setData({
			skins: this.data.skins
		})
	}

	// endregion
}

