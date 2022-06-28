import {IRoomIndex} from "../data/PlayerRoom";
import {BaseData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";

export enum VisitorState {
	Idle, Focusing
}

export class RoomVisitor extends BaseData {

	@field(String)
	public openid: string
	@field
	public state: VisitorState = VisitorState.Idle

	public static create(openid) {
		const res = new RoomVisitor();
		res.openid = openid;
		return res;
	}
}

export class RuntimeRoom extends BaseData implements IRoomIndex {

	@field(String)
	public roomId?: string;
	@field(String)
	public npcRoomId?: number;

	@field([RoomVisitor])
	public visitors: RoomVisitor[] = [];

	public findVisitor(openid) {
		return this.visitors.find(v => v.openid == openid);
	}
	public addVisitor(openid, state = VisitorState.Idle) {
		let res = this.findVisitor(openid);
		if (!res) {
			res = RoomVisitor.create(openid);
			this.visitors.push(res);
		}
		res.state = state;
		return res;
	}
	public removeVisitor(openid) {
		const idx = this.visitors.findIndex(v => v.openid == openid);
		if (idx >= 0) this.visitors.splice(idx, 1);
	}
}
