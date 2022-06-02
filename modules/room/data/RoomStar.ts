import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {field} from "../../core/data/DataLoader";
import {Condition} from "../../player/data/Condition";

@dataClass("RoomStar")
export class RoomStar extends StaticData {

	@field(String)
	public description: string;
	@field
	public maxDuration: number = 90;
	@field([Condition])
	public conditions: Condition[] = [];
	@field(Number)
	public stage: number = 0;

}

export function roomStarRepo() {
	return getRepository(RoomStarRepo);
}

@repository
class RoomStarRepo extends BaseRepository<RoomStar> {
	get clazz() {
		return RoomStar;
	}
}
