import { page, pageFunc } from "../common/PageBuilder";
import {MainPage, MainPageData} from "../main/MainPage";
import {field} from "../../modules/core/data/DataLoader";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {Room} from "../../modules/room/data/Room";
import {Focus} from "../../modules/focus/data/Focus";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {PromiseUtils} from "../../utils/PromiseUtils";

class Params {
	@field(String)
	roomId: string
}

@page("visit", "他人房间")
export class VisitPage extends MainPage<Params> {

	protected getRoom() {
		const roomId = this.getExtra("roomId") || this.params.roomId;
		return roomMgr().getRoom({roomId}) as Promise<Room>
	}

	protected async processCurFocusing(focus: Focus) {
		if (focus.roomId == this.params.roomId) {
			await PromiseUtils.waitFor(() => this.item && this.isEntered);
			await this.onFocusStart(focus)
			playerMgr().extra.focus = null; // 处理完毕
		}
	}
}
