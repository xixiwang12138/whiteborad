import {StaticData} from "../../core/data/StaticData";
import {field} from "../../core/data/DataLoader";
import {Effect} from "./Effect";
import {Trait} from "./Trait";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {Constructor} from "../../core/BaseContext";
import {Animation, PictureLayer} from "./IRoomDrawable";
import {Condition} from "../../player/data/Condition";
import {ParamType} from "./Room";

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

	public get thumbnailUrl() {
		return this.thumbnail || `@/npcRooms/thumbnails/${this.id}.png` || this.pictureUrl;
	}
	public get pictureUrl() {
		return this.picture || `@/npcRooms/pictures/${this.id}.png`;
	}

	// region 属性控制

	/**
	 * 获取属性
	 */
	public param(index: ParamType) {
		return this.params[index];
	}

	/**
	 * 属性快速访问
	 */
	public get gb() { return this.param(ParamType.GB) }
	public get eb() { return this.param(ParamType.EB) }

	// endregion
}

export function npcRoomRepo() {
	return getRepository(NPCRoomRepo)
}

@repository
export class NPCRoomRepo extends BaseRepository<NPCRoom> {

	get clazz(): Constructor<NPCRoom> { return NPCRoom; }

}
