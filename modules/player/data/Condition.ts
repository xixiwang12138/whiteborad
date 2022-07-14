import {BaseData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";

export enum ConditionType {
	Func = "func",

	Gold = "gold",
	Level = "level",

	RoomSkin = "roomSkin",
	RoomStar = "roomStar",

	Motion = "motion",

	FocusCount = "focusCount", // 专注次数

	InviteCount = "inviteCount",

	Score = "score",

	// TODO: 补充更多
}

export type CompareType = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte'

export const DefaultThrowFunc = () => {throw "Condition not met！"};

export function cEq(type: ConditionType, value: number, consumable: boolean = true,
	params: object = {}, errMsg?: string) {
	return Condition.eq(type, value, consumable, params, errMsg);
}
export function cNeq(type: ConditionType, value: number, consumable: boolean = true,
										 params: object = {}, errMsg?: string) {
	return Condition.neq(type, value, consumable, params, errMsg);
}
export function cGte(type: ConditionType, value: number, consumable: boolean = true,
										 params: object = {}, errMsg?: string) {
	return Condition.gte(type, value, consumable, params, errMsg);
}
export function cGt(type: ConditionType, value: number, consumable: boolean = true,
										 params: object = {}, errMsg?: string) {
	return Condition.gt(type, value, consumable, params, errMsg);
}
export function cLte(type: ConditionType, value: number, consumable: boolean = true,
										 params: object = {}, errMsg?: string) {
	return Condition.lte(type, value, consumable, params, errMsg);
}
export function cLt(type: ConditionType, value: number, consumable: boolean = true,
										 params: object = {}, errMsg?: string) {
	return Condition.lt(type, value, consumable, params, errMsg);
}
export function cFun(jFunc: Function, tFunc: Function = DefaultThrowFunc, errMsg?: string) {
	return Condition.fun(jFunc, tFunc, errMsg);
}

export class Condition extends BaseData {

	@field
	public type: ConditionType = ConditionType.Gold;
	@field
	public value: number = 100;
	@field(Object)
	public params: any = {};

	@field
	public compare: CompareType = "gte";
	@field
	public consumable: boolean = true;

	@field(String)
	public errMsg: string;

	protected constructor(type, value, compare,
												consumable, params, errMsg) {
		super();
		this.type = type;
		this.value = value;
		this.compare = compare;
		this.consumable = consumable;
		this.params = params;
		this.errMsg = errMsg;
	}

	public static eq(type: ConditionType, value: number, consumable: boolean = true,
									 params: object = {}, errMsg?: string) {
		return new Condition(type, value, "eq", consumable, params, errMsg);
	}
	public static neq(type: ConditionType, value: number, consumable: boolean = true,
										params: object = {}, errMsg?: string) {
		return new Condition(type, value, "neq", consumable, params, errMsg);
	}
	public static gte(type: ConditionType, value: number, consumable: boolean = true,
										params: object = {}, errMsg?: string) {
		return new Condition(type, value, "gte", consumable, params, errMsg);
	}
	public static gt(type: ConditionType, value: number, consumable: boolean = true,
									 params: object = {}, errMsg?: string) {
		return new Condition(type, value, "gt", consumable, params, errMsg);
	}
	public static lte(type: ConditionType, value: number, consumable: boolean = false,
										params: object = {}, errMsg?: string) {
		return new Condition(type, value, "lte", consumable, params, errMsg);
	}
	public static lt(type: ConditionType, value: number, consumable: boolean = false,
									 params: object = {}, errMsg?: string) {
		return new Condition(type, value, "lt", consumable, params, errMsg);
	}

	public static fun(jFunc: Function, tFunc: Function, errMsg?: string) {
		return new Condition(ConditionType.Func,
			null, null, false,
			{ jFunc, tFunc }, errMsg);
	}

}

import {createProcessor} from "../utils/ConditionProcessor";

export class ConditionGroup extends BaseData {

	@field([Condition])
	public conditions: Condition[] = [];

	public static create(...conds: (Condition | ConditionGroup)[]) {
		const res = new ConditionGroup();
		conds.forEach(cond => res.add(cond));
		return res;
	}

	public add(cond: Condition | ConditionGroup) {
		if (cond instanceof Condition) {
			if (cond.type != ConditionType.Func) {
				const curCond = this.find(cond.type);
				if (curCond) curCond.value += cond.value;
				else this.conditions.push(cond.clone());
			} else this.conditions.push(cond.clone());
		} else
			cond.conditions.forEach(c => this.add(c))
	}

	public process() {
		const processors = this.conditions.map(
			c => createProcessor(c));

		for (const p of processors) p.check();
		for (const p of processors) p.consume();
	}

	public check() {
		const processors = this.conditions.map(
			c => createProcessor(c));
		for (const p of processors) p.check();
	}

	public judge() {
		const processors = this.conditions.map(
			c => createProcessor(c));
		return processors.every(p => p.judge());
	}

	public find(type: ConditionType) {
		return this.conditions.find(c => c.type == type);
	}

	// region 快捷查找

	public get gold() { return this.find(ConditionType.Gold); }
	public get level() { return this.find(ConditionType.Level); }

	// endregion

}
