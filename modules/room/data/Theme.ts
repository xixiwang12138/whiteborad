import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {DataOccasion, field, occasion} from "../../core/data/DataLoader";
import {Animation, IRoomDrawable, PictureLayer} from "./IRoomDrawable";
import {cGte, Condition, ConditionGroup, ConditionType} from "../../player/data/Condition";
import {CloudFileUtils} from "../../../utils/CloudFileUtils";
import {playerMgr} from "../../player/managers/PlayerManager";
import {PlayerRoom} from "./PlayerRoom";
import {roomMgr} from "../managers/RoomManager";
import {Constructor} from "../../core/BaseContext";

export type Color = string;
export const DefaultThemeId = 1;

@dataClass("Theme")
export class Theme extends StaticData {

	@field(String)
	public name: string;

	@field(String)
	public mainColor: Color;
	@field(String)
	public darkColor: Color;
	@field(String)
	public lightColor: Color;
	@field(String)
	public topColor: Color;
	@field(String)
	public bottomColor: Color;

	// region 额外数据

	public async refresh() {
	}

	// endregion

}

export function themeRepo() {
	return getRepository(ThemeRepo);
}

@repository
class ThemeRepo extends BaseRepository<Theme> {
	get clazz(): Constructor<Theme> { return Theme; }
}
