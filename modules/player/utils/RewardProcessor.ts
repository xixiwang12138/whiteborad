import {Reward, RewardType} from "../Data/Reward";
import {Constructor} from "../../core/BaseContext";

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

	public abstract invoke(rate?);
}
