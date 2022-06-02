import {BaseData, pkType} from "../../core/data/BaseData";
import {DataOccasion, dataPK, field, occasion} from "../../core/data/DataLoader";
import {Player} from "../../player/data/Player";
import {Trait} from "./Trait";
import {DynamicData} from "../../core/data/DynamicData";
import {IRoomDrawable} from "./IRoomDrawable";
import {Effect} from "./Effect";
import {roomSkinRepo} from "./RoomSkin";
import {roomStarRepo} from "./RoomStar";

export enum RoomState {
	Uncreated, Created, Banned
}

export enum ParamType {
	GB, // Gold Bonus: 金币加成
	EB, // Exp Bonus: 经验值加成
}

export type RoomEditableInfo = {
	name?: string,
	notice?: string
}

const DefaultMinDuration = 15;

export class Room extends DynamicData implements IRoomDrawable {

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
	public starId: number = 1;

	@field([Number])
	public params: number[] = [];
	@field([Effect])
	public effects: Effect[] = [];
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

	@field
	@occasion(DataOccasion.Extra)
	public minDuration: number = DefaultMinDuration;
	@field
	@occasion(DataOccasion.Extra)
	public maxDuration: number = 90;

	public refresh() {
		this.maxDuration = this.star.maxDuration;
	}

	// endregion

	// region 绘制数据

	public get skin() { return roomSkinRepo().getById(this.skinId) }

	public get thumbnail() { return this.skin.thumbnail }
	public get picture() { return this.skin.picture }
	public get layers() { return this.skin.layers }
	public get animations() { return this.skin.animations }

	public get thumbnailUrl() { return this.skin.thumbnailUrl; }
	public get pictureUrl() { return this.skin.pictureUrl; }

	// endregion

	public get star() { return roomStarRepo().getById(this.starId) }

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
		res.skinId = 0;
		res.notice = "好好学习，加油买房！";

		return res;
	}

}

export class RoomInfo extends BaseData {

	@field(String)
	public roomId: string;
	@field(String)
	public displayId: string;
	@field
	public name: string = "";
	@field(String)
	public ownerAccount: string;
	@field(pkType())
	public openid: string;

	@field
	public star: number = 1;

	@field(Number)
	public skinId: number;
	@field
	public state: RoomState = RoomState.Uncreated;

	@field
	public playerOnline: boolean = false
	@field(String)
	public playerName: string
	@field(String)
	public playerAvatar: string
}

export class RoomData extends BaseData {

	@field(String)
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
	public star: number = 1;

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

	@field
	public playerOnline: boolean = false
	@field(String)
	public playerName: string
	@field(String)
	public playerAvatar: string

	// region 额外数据

	public refresh() {

	}

	// endregion

}
