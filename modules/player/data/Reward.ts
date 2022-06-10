import {BaseData} from "../../core/data/BaseData";
import {DataOccasion, field, occasion} from "../../core/data/DataLoader";

export enum RewardType {
	Gold = "gold",
	Exp = "exp",

	RoomSkin = "roomSkin",
	RoomStar = "roomStar",

	Motion = "motion",

	Score = "score",

	// TODO: 补充更多
}

export function r(type: RewardType, value: number, params = {}) {
	return Reward.create(type, value, params);
}

export class Reward extends BaseData {

	@field
	public type: RewardType = RewardType.Gold;
	@field
	public value: number = 0;
	@field(Object)
	public bonus: {rate: number, val: number} = {rate: 0, val: 0};
	@field(Object)
	public params: object = {};

	public get realValue() {
		const rate = this.bonus.rate || 0;
		const val = this.bonus.val || 0;
		return Math.round(this.value * (rate + 1) + val)
	}

	public static create(type: RewardType,
											 value: number, params = {}) {
		const res = new Reward();
		res.type = type;
		res.value = value;
		res.params = params;
		return res;
	}

}

import {createProcessor} from "../utils/RewardProcessor";

export class RewardGroup extends BaseData {

	@field([Reward])
	public rewards: Reward[] = [];

	// region 额外数据

	@field(Number)
	@occasion(DataOccasion.Extra)
	public goldValue: number
	@field(Number)
	@occasion(DataOccasion.Extra)
	public expValue: number

	public refresh() {
		this.goldValue = this.gold.realValue;
		this.expValue = this.exp.realValue;
	}

	// endregion

	public static create(...rewards: (Reward | RewardGroup)[]) {
		const res = new RewardGroup();
		rewards.forEach(reward => res.add(reward));
		return res;
	}

	public add(reward: Reward | RewardGroup) {
		if (reward instanceof Reward) {
			const curCond = this.find(reward.type);
			if (curCond) curCond.value += reward.value;
			else this.rewards.push(reward.clone());
		} else
			reward.rewards.forEach(c => this.add(c))
	}

	public push(reward: Reward) {
		this.rewards.push(reward);
	}

	public descriptions() {
		const processors = this.rewards.map(
			r => createProcessor(r));
		return processors.map(p => p.description).filter(d => !!d);
	}

	public invoke(rate = 1) {
		const processors = this.rewards.map(
			r => createProcessor(r));

		for (const p of processors) p.check();
		for (const p of processors) p.invoke(rate);
	}

	public find(type: RewardType) {
		return this.rewards.find(c => c.type == type);
	}

	public bonus(type: RewardType, rate?, val?) {
		this.find(type).bonus.val += val;
		this.find(type).bonus.rate += rate;
	}

	// region 快捷查找

	public get gold() { return this.find(RewardType.Gold); }
	public get exp() { return this.find(RewardType.Exp); }

	// endregion
}
