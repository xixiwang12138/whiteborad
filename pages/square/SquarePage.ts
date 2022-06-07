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
	rooms: RoomInfo[];
	isGetAllRooms:boolean = false;
}

const PageCount = 12;

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
		// await this.roomPage.loadSelfRoom();
		await this.refreshRooms();
	}

	@pageFunc
	onRoomTap(e){
		const roomId: string = e.currentTarget.dataset.id;
		pageMgr().push(VisitPage, { roomId })
	}

	async refreshRooms(){
		this.offset = 0;
		await this.setData({ rooms: [] })
		await this.getRoomsList();
	}

	async getRoomsList(){
		if (this.data.isGetAllRooms) return;

		const roomsRes = await roomMgr()
			.getRooms(this.offset, PageCount);
		let rooms: RoomInfo[] = roomsRes.rooms;

		// 判断是否到达房间列表底部
		const isGetAllRooms = rooms.length < PageCount;
		this.offset += rooms.length;

		let curRooms: RoomInfo[] = this.data.rooms;
		// 自己的房间不能出现 TODO: 后端实现
		rooms = rooms.filter(r => r.openid != this.playerPage.openid);
		rooms = curRooms.concat(rooms);

		await this.setData({
			rooms, isGetAllRooms
		});
	}
}
