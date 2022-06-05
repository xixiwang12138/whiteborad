import { page, pageFunc } from "../common/PageBuilder";
import {MainPage} from "../main/MainPage";
import {BaseData} from "../../modules/core/data/BaseData";
import {field} from "../../modules/core/data/DataLoader";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {Room} from "../../modules/room/data/Room";

class Params extends BaseData {
	@field(String)
	roomId?: string
}

@page("visit", "他人房间")
export class VisitPage extends MainPage<Params> {

	async onLoad(e: Params) {
		await super.onLoad(e);
		if (e.roomId) this.params.roomId ||= e.roomId;

	}

	protected getRoom() {
		return roomMgr().getRoom({roomId: this.params.roomId}) as Promise<Room>
	}

}
