import {MainData, pkType} from "../../core/data/BaseData";
import {dataPK, field} from "../../core/data/DataLoader";
import {Player} from "../../player/data/Player";
import {Trait} from "./Trait";

export enum RoomState {
	Uncreated, Created, Banned
}

export class Room extends MainData {

	@field(String)
	@dataPK
	public roomId: string;
	@field(String)
	public displayId: string;
	@field
	public name: string = "";
	@field(String)
	public creatorAccount: string;
	@field(String)
	public ownerAccount: string;
	@field(pkType())
	public openid: string;

	@field
	public notice: string = "";
	@field
	public level: number = 1;
	@field
	public exp: number = 0;

	@field
	public minDuration: number = 15;
	@field
	public maxDuration: number = 90;

	@field([Number])
	public params: number[] = [];
	@field([Trait])
	public traits: Trait[] = [];
	@field(Number)
	public skinId: number;
	@field
	public state: RoomState = RoomState.Uncreated;
	// @field(Location)
	// public location: Location;
	@field(Number)
	public createTime: number;

	// region 额外数据

	public refresh() {

	}

	// endregion

	/**
	 * 创建房间
	 */
	public static create(player: Player, roomName: string) {
		const res = new Room();

		res.openid = player.openid;
		res.name = roomName;
		// res.creatorAccount = player.account;

		res.createTime = Date.now();

		return res;
	}

	/**
	 * 测试数据
	 */
	public static testData() {
		const res = new Room();
		res.roomId = "test123456789";
		res.name = "摆烂小屋";
		res.level = 10;
		res.exp = 1000;
		res.skinId = 0;
		res.notice = "好好学习，加油买房！";

		return res;
	}

}
