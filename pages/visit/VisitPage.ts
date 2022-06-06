import { page, pageFunc } from "../common/PageBuilder";
import {MainPage, MainPageData} from "../main/MainPage";
import {BaseData} from "../../modules/core/data/BaseData";
import {field} from "../../modules/core/data/DataLoader";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {Room} from "../../modules/room/data/Room";
import {BasePageData} from "../common/core/BasePage";
import {Focus, FocusTags, RuntimeFocus} from "../../modules/focus/data/Focus";

class Params {
	@field(String)
	roomId: string
}

class Data extends MainPageData {

}

@page("visit", "他人房间")
export class VisitPage extends MainPage<Params> {

	public data = new Data();

	async onLoad(e: Params) {
		if (e.roomId) this.params.roomId ||= e.roomId;
		await super.onLoad(e);
	}

	protected getRoom() {
		return roomMgr().getRoom({roomId: this.params.roomId}) as Promise<Room>
	}

}
