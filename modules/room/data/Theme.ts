import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {DataOccasion, field, occasion} from "../../core/data/DataLoader";
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

	@field(String)
	@occasion(DataOccasion.Extra)
	public get backgroundStyle(): string {
		return `background: -webkit-linear-gradient(top, ${this.topColor}, ${this.bottomColor})`
	}

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
