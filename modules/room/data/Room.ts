import {BaseData, pkType} from "../../core/data/BaseData";
import {DataOccasion, dataPK, field, occasion} from "../../core/data/DataLoader";
import {Player, PlayerBaseInfo} from "../../player/data/Player";
import {Trait} from "./Trait";
import {DynamicData} from "../../core/data/DynamicData";
import {IRoomDrawable} from "./IRoomDrawable";
import {Effect} from "./Effect";
import {roomSkinRepo} from "./RoomSkin";
import {roomStarRepo} from "./RoomStar";
import {CloudFileUtils} from "../../../utils/CloudFileUtils";

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
const FocusFeeRate = 0.5;

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

	@field
	public feeRate: number = FocusFeeRate;

	@field(Number)
	public skinId: number;

	@field
	public state: RoomState = RoomState.Uncreated;
	// @field(Location)
	// public location: Location;
	@field(Number)
	public createTime: number;

	@field(PlayerBaseInfo)
	@occasion(DataOccasion.Interface, DataOccasion.Extra)
	public player?: PlayerBaseInfo;

	// region 额外数据

	@field
	@occasion(DataOccasion.Extra)
	public minDuration: number = DefaultMinDuration;
	@field
	@occasion(DataOccasion.Extra)
	public maxDuration: number = 90;
	// @field(String)
	// @occasion(DataOccasion.Extra)
	// public backgroundStyle: string;
	@field([String])
	@occasion(DataOccasion.Extra)
	public gradientColors: string[];

	public refresh() {
		this.maxDuration = this.star.maxDuration;
		// this.backgroundStyle = `-webkit-linear-gradient(top, #${
		// 	this.skin.backgroundColors[0]}, #${this.skin.backgroundColors[1]});`
		this.gradientColors = this.skin.backgroundColors;
	}

	// endregion

	// region 初始化

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

	// endregion

	// region 数据获取

	public get star() { return roomStarRepo().getById(this.starId) }

	// region 绘制数据

	public get skin() { return roomSkinRepo().getById(this.skinId) }

	public get thumbnail() { return this.skin.thumbnail }
	public get picture() { return this.skin.picture }
	public get layers() { return this.skin.layers }
	public get animations() { return this.skin.animations }

	public get thumbnailUrl() { return this.skin.thumbnailUrl; }
	public get pictureUrl() { return this.skin.pictureUrl; }

	// endregion

	// endregion

	// region 属性控制

	/**
	 * 获取属性
	 */
	public param(index: ParamType) {
		return this.params[index] + this.skin?.params[index] || 0;
	}

	/**
	 * 属性快速访问
	 */
	public get gb() { return this.param(ParamType.GB) }
	public get eb() { return this.param(ParamType.EB) }

	// endregion

	// region 业务操作

	public editInfo(info: RoomEditableInfo) {
		Object.assign(this, info);
	}

	public switchSkin(skinId: number) {
		this.skinId = skinId;
		this.starId = this.skin.level;
	}

	// endregion

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
	@field(String)
	public openid: string;

	@field
	public starId: number = 1;

	@field(Number)
	public skinId: number;
	@field
	public state: RoomState = RoomState.Uncreated;

	@field(String)
	public playerName: string
	@field(String)
	public playerAvatar: string
	// @field(Number)
	// public playerLevel: number

	@field(String)
	@occasion(DataOccasion.Extra)
	public thumbnail: string;

	public refresh() {
		const url = this.skinId && roomSkinRepo().getById(this.skinId).thumbnailUrl;
		this.thumbnail = url.startsWith("@") ?
			CloudFileUtils.pathToFileId(url) : url;
	}
}

// export class RoomData extends BaseData {
//
// 	@field(String)
// 	public roomId: string;
// 	@field(String)
// 	public displayId: string;
// 	@field
// 	public name: string = "";
// 	@field(String)
// 	public creatorAccount: string;
// 	@field(String)
// 	public ownerAccount: string;
// 	@field(pkType())
// 	public openid: string;
//
// 	@field
// 	public notice: string = "";
// 	@field
// 	public star: number = 1;
//
// 	@field
// 	public minDuration: number = 15;
// 	@field
// 	public maxDuration: number = 90;
//
// 	@field([Number])
// 	public params: number[] = [];
// 	@field([Effect])
// 	public effects: Effect[] = [];
// 	@field([Trait])
// 	public traits: Trait[] = [];
//
// 	@field
// 	public feeRate: number = FocusFeeRate;
//
// 	@field(Number)
// 	public skinId: number;
// 	@field
// 	public state: RoomState = RoomState.Uncreated;
// 	// @field(Location)
// 	// public location: Location;
// 	@field(Number)
// 	public createTime: number;
//
// 	@field
// 	public playerOnline: boolean = false
// 	@field(String)
// 	public playerName: string
// 	@field(String)
// 	public playerAvatar: string
//
// 	// region 额外数据
//
// 	public refresh() {
//
// 	}
//
// 	// endregion
//
// 	public toRoom() {
// 		const res = new Room();
// 		Object.assign(res, this);
// 		return res;
// 	}
//
// }
