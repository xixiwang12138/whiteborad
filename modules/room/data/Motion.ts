import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {Reward, RewardGroup} from "../../player/data/Reward";
import {field} from "../../core/data/DataLoader";
import {Condition, ConditionGroup} from "../../player/data/Condition";

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
	public thumbnail?: string // 缩略图
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

	@field(Number)
	public count: number; // 持续帧数
	@field
	public duration: number = 1; // 单次播放时长（秒）

	public get thumbnailUrl() {
		return this.thumbnail || `@/motions/thumbnails/${this.id}.png`;
	}
	public pictureUrl(gender = 0) {
		return `@/motions/animations/${this.id}` + (gender > 0 ? `-${gender}.png` : `.png`);
	}

	// region 奖励计算

	public get conditionGroup() {
		return ConditionGroup.create(...this.conditions)
	}
	public get unlockRewardGroup() {
		return RewardGroup.create(...this.unlockRewards)
	}
	public get rewardGroup() {
		return RewardGroup.create(...this.rewards)
	}
	public get unlockGold() {
		return this.unlockRewardGroup.gold.realValue
	}
	public get unlockExp() {
		return this.unlockRewardGroup.exp.realValue
	}
	public get gold() {
		return this.rewardGroup.gold.realValue
	}
	public get exp() {
		return this.rewardGroup.exp.realValue
	}

	// endregion
}

export function motionRepo() {
	return getRepository(MotionRepo);
}

@repository
class MotionRepo extends BaseRepository<Motion> {

	get clazz() { return Motion; }
}
