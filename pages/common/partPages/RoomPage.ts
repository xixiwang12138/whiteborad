import { BaseData } from "../../../modules/core/data/BaseData";
import {PartialPage} from "../core/BasePage";
import {pageFunc} from "../PageBuilder";
import {CanvasPage} from "./CanvasPage";
import {field} from "../../../modules/core/data/DataLoader";
import {roomMgr} from "../../../modules/room/managers/RoomManager";
import {Room} from "../../../modules/room/data/Room";


const MaxCanvasSize = 1365;

class Data extends BaseData {

	@field(Room)
	room: Room
	@field(String)
	backgroundStyle: string;
}

export class RoomPage extends CanvasPage<Data> {

	public data = new Data();

	public get room() { return this.data.room }

	public async loadSelfRoom() {
		const room = await roomMgr().getSelfRoom();
		await this.setData({room});
	}
}
