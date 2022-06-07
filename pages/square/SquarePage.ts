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
import {QueryPage, QueryParams} from "../common/partPages/QueryPage";

class Data extends BasePageData {

	@field([Object])
	rooms: RoomInfo[] = [];
	@field(String)
	queryText: string = "";
}

const PageCount = 12;

@page("square", "广场")
export class SquarePage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();
	public queryPage: QueryPage = new QueryPage(
		this.loadRooms.bind(this)
	)
	public roomPage: RoomPage = new RoomPage();

	private offset:number = 0;

	public async onReady() {
		super.onReady();
		await this.onLogin();
		wx.pageScrollTo({
			scrollTop: 0
		})
	}

	@waitForLogin
	private async onLogin() {
		// await this.roomPage.loadSelfRoom();
		await this.refreshRooms();
	}

	@pageFunc
	private onRoomTap(e){
		const roomId: string = e.currentTarget.dataset.id;
		pageMgr().push(VisitPage, { roomId })
	}

	private async refreshRooms(){
		this.queryPage.resetPage();
		await this.queryPage.refresh();
	}
	private async loadRooms(queryParams: QueryParams) {
		// queryParams.filter.openid = [
		// 	"_.neq", this.playerPage.openid
		// ];
		const roomsRes = await roomMgr()
			.getRooms(queryParams.offset, queryParams.count,
				this.data.queryText, queryParams.filter);
		let rooms: RoomInfo[] = roomsRes.rooms;
		let curRooms: RoomInfo[] = this.data.rooms;
		rooms = rooms.filter(r => r.openid != this.playerPage.openid);
		rooms = curRooms.concat(rooms);

		await this.setData({ rooms });
	}
}
