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

const RoomPosition = [0.5, 0.75];
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

	@field(Array)
	Rooms= [{
		roomStatus: 'changeable'
	},{
		roomStatus: 'using'
	},{
		roomStatus: 'purchasable',price: "4396"
	},{
		roomStatus: 'locked',price: "4396",unlock:"10级解锁购买"
	},{
		roomStatus: 'locked',price: "4396",unlock:"15级解锁购买"
	},]
	@field(Array)
	Others= [{
		roomStatus: 'purchasable',price: "4396"
	},{
		roomStatus: 'owned'
	},{
		roomStatus: 'owned'
	},{
		roomStatus: 'locked',price: "4396",unlock:"解锁房间购买"
	},{
		roomStatus: 'locked',price: "4396",unlock:"解锁房间购买"
	},]
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
		await this.setData({skins});
	}
	private async loadRoom() {
		const room = await roomMgr().getSelfRoom();
		await this.setItem(room.clone());
	}

	// region 事件

	/**
	 * 选择一个皮肤
	 */
	@pageFunc
	public onSkinTap(e) {
		// 换装
		this.item.skinId = Number(e.currentTarget.dataset.skinId);
		this.refresh();
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
	}

	// endregion
}

