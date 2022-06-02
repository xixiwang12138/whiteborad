import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {Reward} from "../../player/data/Reward";
import {field} from "../../core/data/DataLoader";
import {Condition} from "../../player/data/Condition";

export enum MotionRare {
	N, R, SR, SSR, UR
}

@dataClass("Motion")
export class Motion extends StaticData {

	@field(String)
	public name: string
	@field(String)
	public description: string
	@field(String)
	public thumbnail: string // 缩略图
	@field
	public rate: number = 1 // 几率（每分钟）
	@field
	public rare: MotionRare = MotionRare.N; // 稀有度
	@field([Condition])
	public conditions: Condition[] = [] // 稀有度
	@field([Reward])
	public unlockRewards: Reward[] = [] // 解锁奖励
	@field([Reward])
	public rewards: Reward[] = [] // 出现奖励

	public get thumbnailUrl() {
		return this.thumbnail || `/motions/${this.id}.png`;
	}
}

export function motionRepo() {
	return getRepository(MotionRepo);
}

@repository
class MotionRepo extends BaseRepository<Motion> {

	get clazz() { return Motion; }
}
