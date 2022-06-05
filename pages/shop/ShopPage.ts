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

class Data extends BasePageData {

	@field(Room)
	item: Room

	@field([RoomSkin])
	skins: RoomSkin[] = []
	@field([Motion])
	motions: Motion[] = []

	@field(PlayerRoom)
	playerRoom: PlayerRoom

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

// const isRooms=true;
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
		this.loadData();
		await this.loadRoom();
		await this.roomDrawingPage.draw(this.item);
	}
	private loadData() {
		const skins = roomSkinRepo().list;
		const motions = motionRepo().list;
		const playerRoom = playerMgr().getData(PlayerRoom);
		this.setData({skins, motions, playerRoom});
	}
	private async loadRoom() {
		// const room = Room.testData();
		const room = await roomMgr().getSelfRoom();
		await this.setItem(room.clone());
	}

	@pageFunc
		//切换小屋
		public tapToChange1(){
			this.setData({
				isRooms:true
			})
		}
		@pageFunc
		//切换小屋
		public tapToChange2(){
			this.setData({
				isRooms:false
			})
		}
}

