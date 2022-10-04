import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {DataOccasion, field, occasion} from "../../core/data/DataLoader";
import {Constructor} from "../../core/BaseContext";
import {Animation, IDrawable, PictureLayer} from "./IDrawable";
import {RoomSkin, roomSkinRepo} from "./RoomSkin";
import {Condition} from "../../player/data/Condition";

export enum FurnitureType {
	Wall,
	Floor,
	TableChair,
	Bed,
	Cabinet,
	Decoration1,
	Decoration2
}

@dataClass("Furniture")
export class Furniture extends StaticData implements IDrawable {

	@field(Number)
	public skinId?: number;
	@field(String)
	public thumbnail?: string;

	@field(String)
	public picture?: string
	@field([PictureLayer])
	public layers?: PictureLayer[] = []
	@field([Animation])
	public animations?: Animation[] = []

	@field([Number])
	public params: number[] = [0, 0];

	@field([Condition])
	public conditions: Condition[] = []; // 解锁条件

	@field(Number)
	public price: number;

	public get rootPath() { return "furniture"; }

	public get thumbnailUrl() {
		return this.thumbnail || `@/${this.rootPath}/thumbnails/${this.id}.png` || this.pictureUrl;
	}
	public get pictureUrl() {
		return this.picture || `@/${this.rootPath}/pictures/${this.id}.png`;
	}

	// region 数据获取

	public get skin() { return roomSkinRepo().getById(this.skinId); }

	// endregion

	// region 额外数据

	// endregion

}

export function furnitureRepo() {
	return getRepository(FurnitureRepo);
}

@repository
class FurnitureRepo extends BaseRepository<Furniture> {
	get clazz(): Constructor<Furniture> { return Furniture; }

	// @ts-ignore
	public findBySkinId(skinId: number): Furniture[] {}
}
