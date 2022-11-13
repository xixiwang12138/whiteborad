import {Reward, RewardType} from "./Reward";

export function rewardProcessor(type: RewardType) {
	return (clazz) => {
		RewardProcessor.processorSettings[type.toUpperCase()] = clazz;
	}
}

export function createProcessor(openid: string, reward: Reward) {
	const type = reward.type.toUpperCase();
	const clazz = RewardProcessor.processorSettings[type];
	return new clazz(openid, reward);
}

export abstract class RewardProcessor {

	public static processorSettings:
		{ [K: string]: Constructor<RewardProcessor> } = {};

	public openid: string;
	public reward: Reward;

	protected constructor(openid: string, reward: Reward) {
		this.openid = openid;
		this.reward = reward;
	}

	public get value() { return this.reward.realValue; }

	/**
	 * 预处理
	 */
	protected async preprocess() { }

	/**
	 * 附带条件
	 */
	protected conditions(): ConditionGroup { return null; };

	/**
	 * 消耗
	 */
	public async check() {
		await this.preprocess();
		await this.conditions()?.process(this.openid);
	}

	public abstract invoke(rate?);
}

import {Constructor} from "../../utils/SingletonUtils";
