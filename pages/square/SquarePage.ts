import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr, waitForLogin} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {VisitPage} from "../visit/VisitPage";
import {RoomPage} from "../common/partPages/RoomPage";
import {field} from "../../modules/core/data/DataLoader";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {Room, RoomInfo} from "../../modules/room/data/Room";

class Data extends BasePageData {

	@field([Object])
	roomList: RoomInfo[];
	isGetAllRooms:boolean = false;
}

@page("square", "广场")
export class SquarePage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();
	public roomPage: RoomPage = new RoomPage();

	private offset:number = 0;

	async onReady() {
		super.onReady();
		await this.onLogin();
	}

	@waitForLogin
	async onLogin() {
		await this.roomPage.loadSelfRoom();
		await this.refreshRooms();
	}

	@pageFunc
	toVisit(){
		pageMgr().push<any, BasePage>(VisitPage)
	}

	async refreshRooms(){
		this.offset=0;
		await this.setData({
			roomList: []
		})
		await this.getRoomsList();

	}

	async getRoomsList(){
		const count:number = 12;		//单次获取房间列表长度
		if(!this.data.isGetAllRooms){
		const tempRoomAndNPCList = await roomMgr().getRooms(this.offset,count,"",{});
		const tempRoomList:RoomInfo[] = tempRoomAndNPCList.rooms;

		//判断是否到达房间列表底部
		if(tempRoomList.length < count)await this.setData({
			isGetAllRooms: true
		});
		this.offset += tempRoomList.length;

		let roomList:RoomInfo[] = this.data.roomList;
		tempRoomList.forEach((value,index)=>{
			roomList.push(value);
		});

		await this.setData({roomList});
		}
	}
}
