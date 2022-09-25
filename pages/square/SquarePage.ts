import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr, waitForLogin} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {VisitPage} from "../visit/VisitPage";
import {ShopPage} from "../shop/ShopPage";
import {RoomPage} from "../common/partPages/RoomPage";
import {field} from "../../modules/core/data/DataLoader";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {Room, RoomInfo} from "../../modules/room/data/Room";
import {QueryPage, QueryParams} from "../common/partPages/QueryPage";
import {ShareAppPage} from "../common/partPages/SharePage";
import {ThemePage} from "../common/partPages/ThemePage";

class Data extends BasePageData {

	@field([Object])
	rooms: RoomInfo[] = [];
	@field(String)
	queryText: string = "";
}

@page("square", "广场")
export class SquarePage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage = new PlayerPage();
	public roomPage = new RoomPage();
	public shareAppPage = new ShareAppPage();
	public themePage = new ThemePage();
	public queryPage = new QueryPage<RoomInfo>(
		this.loadRooms.bind(this), "rooms"
	)

	public onShow() {
		super.onShow();
		// wx.pageScrollTo({ scrollTop: 0 })
	}

	public async onLoad(e) {
		await super.onLoad(e);
		this.queryPage.resetPage();
		await this.queryPage.refresh();
	}

	@waitForLogin
	private async loadRooms(queryParams: QueryParams) {
		queryParams.filter.openid = {
			"$ne": playerMgr().openid
		};
		this.shareAppPage.extra = {
			code: playerMgr().player.inviteCode
		};
		return (await roomMgr().getRooms(
			queryParams.offset, queryParams.count,
			this.data.queryText, queryParams.filter)).rooms;
	}

	@pageFunc
	private onRoomTap(e){
		const roomId: string = e.currentTarget.dataset.id;
		pageMgr().push(VisitPage, { roomId })
	}

	@pageFunc
  onShopTap() { pageMgr().push(ShopPage); }

	// private async loadRooms(queryParams: QueryParams) {
	// 	queryParams.filter.openid = [
	// 		"_.neq", this.playerPage.openid
	// 	];
	// 	const roomsRes = await roomMgr()
	// 		.getRooms(queryParams.offset, queryParams.count,
	// 			this.data.queryText, queryParams.filter);
	// 	let rooms: RoomInfo[] = roomsRes.rooms;
	// 	let curRooms: RoomInfo[] = this.data.rooms;
	// 	rooms = rooms.filter(r => r.openid != this.playerPage.openid);
	// 	rooms = curRooms.concat(rooms);
	//
	// 	await this.setData({ rooms });
	// }
}
