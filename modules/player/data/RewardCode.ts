import {MainData} from "../../core/data/BaseData";
import {dataPK, field} from "../../core/data/DataLoader";
import {Condition, ConditionGroup} from "./Condition";
import {Reward, RewardGroup} from "./Reward";

export enum RewardCodeState {
	Normal, Used, Closed
}

export class RewardCode extends MainData {

	@field(String) @dataPK
	public code: string;
	@field([Condition])
	public conditions: Condition[] = [];
	@field([Reward])
	public rewards: Reward[] = [];
	@field(String)
	public description: string; // 描述
	@field(Number)
	public startTime: number; // 开始时间
	@field(Number)
	public endTime: number; // 结束时间
	@field(Number)
	public useTime: number; // 使用时间
	@field(Number)
	public state: RewardCodeState = RewardCodeState.Normal;
	@field(String)
	public receiver: string; // 领取人

	public conditionGroup() {
		return ConditionGroup.create(...this.conditions);
	}
	public rewardGroup() {
		return RewardGroup.create(...this.rewards);
	}
}
