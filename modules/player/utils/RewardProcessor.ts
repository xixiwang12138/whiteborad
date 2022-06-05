import {Reward, RewardType} from "../data/Reward";
import {Constructor} from "../../core/BaseContext";
import {playerMgr} from "../managers/PlayerManager";

export function rewardProcessor(type: RewardType) {
	return (clazz) => {
		RewardProcessor.processorSettings[type] = clazz;
	}
}

export function createProcessor(reward: Reward) {
	const clazz = RewardProcessor.processorSettings[reward.type];
	return new clazz(reward);
}

export abstract class RewardProcessor {

	public static processorSettings:
		{ [K: string]: Constructor<RewardProcessor> } = {};

	public reward: Reward;

	protected constructor(reward: Reward) {
		this.reward = reward;
	}

	public get value() { return this.reward.value; }

	public get player() { return playerMgr().player }

	public abstract invoke(rate?);
}

@rewardProcessor(RewardType.Gold)
class GoldRewardProcessor extends RewardProcessor {

	async invoke(rate?) {
		this.player?.gainGold(this.value);
	}
}
@rewardProcessor(RewardType.Exp)
class ExpRewardProcessor extends RewardProcessor {

	async invoke(rate?) {
		this.player?.gainExp(this.value);
	}
}
