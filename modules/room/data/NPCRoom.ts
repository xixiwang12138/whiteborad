import {StaticData} from "../../core/data/StaticData";
import {field} from "../../core/data/DataLoader";
import {Effect} from "./Effect";
import {Trait} from "./Trait";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {Constructor} from "../../core/BaseContext";
import {Animation, PictureLayer} from "./Animation";
import {Condition} from "../../player/data/Condition";

export enum NPCRoomState {
	Closed = -2, Building, Opened
}
export enum NPCRoomType {
	NPC, Functional
}

export class NPCRoom extends StaticData {

	@field
	public name: string = "";
	@field(String)
	public thumbnail?: string;

	@field(String)
	public picture: string;
	@field([PictureLayer])
	public layers: PictureLayer[] = []; // 额外图层
	@field([Animation])
	public animations: Animation[]; // 动画

	@field([Number])
	public params: number[] = [0, 0];
	@field([Effect])
	public effects: Effect[] = [];
	@field([Trait])
	public traits: Trait[] = [];

	@field(Number)
	public type: NPCRoomType = NPCRoomType.NPC;
	@field(String)
	public page?: string; // 跳转的页面路径

	@field
	public rate: number = 0.1 // 几率
	@field([Condition])
	public conditions: Condition[] = [] // 稀有度

	// @field(Location)
	// public location: Location;
	@field
	public state: NPCRoomState = NPCRoomState.Closed;

}

export function npcRoomRepo() {
	return getRepository(NPCRoomRepo)
}

@repository
export class NPCRoomRepo extends BaseRepository<NPCRoom> {

	get clazz(): Constructor<NPCRoom> { return NPCRoom; }

}
