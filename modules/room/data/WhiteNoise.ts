import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {Reward} from "../../player/data/Reward";
import {field} from "../../core/data/DataLoader";
import {Condition} from "../../player/data/Condition";

@dataClass("WhiteNoise")
export class WhiteNoise extends StaticData {

	@field(String)
	public title: string
	@field(String)
	public epname: string
	@field(String)
	public singer: string
	@field(String)
	public src: string
	@field(Number)
	public type: number

}

export function whiteNoiseRepo() {
	return getRepository(WhiteNoiseRepo);
}

@repository
class WhiteNoiseRepo extends BaseRepository<WhiteNoise> {

	get clazz() { return WhiteNoise; }

	// @ts-ignore
	public findByType(type: number): WhiteNoise[] {}
}
