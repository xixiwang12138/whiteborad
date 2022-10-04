import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {Reward, RewardGroup} from "../../player/data/Reward";
import {DataOccasion, field, occasion} from "../../core/data/DataLoader";
import {Condition, ConditionGroup} from "../../player/data/Condition";
import {CloudFileUtils} from "../../../utils/CloudFileUtils";
import {roomMgr} from "../managers/RoomManager";
import {playerMgr} from "../../player/managers/PlayerManager";
import {PlayerRoom} from "./PlayerRoom";

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

	public get thumbnailUrl() {
		return this.thumbnail || `/motions/thumbnails/${this.id}.png`;
	}

	// region 额外数据

	@field(Boolean)
	@occasion(DataOccasion.Extra)
	isUnlock: boolean;
	@field(Boolean)
	@occasion(DataOccasion.Extra)
	isUnclaimed: boolean;

	public async refresh() {
		const records = (await roomMgr().getPlayerMotion()).records;
		const playerMotionRecord = records.find(pm => pm.motionId == this.id)

		this.isUnlock = playerMotionRecord != null;
		this.isUnclaimed = playerMotionRecord != null && playerMotionRecord.rewardTime == null;
		//console.log("Motion Refresh On",this);
	}

	// endregion

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
