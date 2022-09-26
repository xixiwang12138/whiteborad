import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {DataOccasion, field, occasion} from "../../core/data/DataLoader";
import {Constructor} from "../../core/BaseContext";
import {Animation, PictureLayer} from "./IRoomDrawable";
import {RoomSkin, roomSkinRepo} from "./RoomSkin";

@dataClass("Furniture")
export class Furniture extends StaticData {

	@field(Number)
	public skinId?: number

	@field(String)
	public picture?: string
	@field([PictureLayer])
	public layers?: PictureLayer[] = []
	@field([Animation])
	public animations?: Animation[] = []

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
}
