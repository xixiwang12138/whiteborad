import { page, pageFunc } from "../common/PageBuilder";
import {MainPage, MainPageData} from "../main/MainPage";
import {field} from "../../modules/core/data/DataLoader";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {Room} from "../../modules/room/data/Room";

class Params {
	@field(String)
	roomId: string
}

@page("visit", "他人房间")
export class VisitPage extends MainPage<Params> {

	async onLoad(e: Params) {
		if (e.roomId) this.params.roomId ||= e.roomId;
		await super.onLoad(e);
	}

	protected getRoom() {
		return roomMgr().getRoom({roomId: this.params.roomId}) as Promise<Room>
	}

}
