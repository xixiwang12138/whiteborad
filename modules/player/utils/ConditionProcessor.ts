import {Condition, ConditionType} from "../Data/Condition";
import {Constructor} from "../../core/BaseContext";

export function conditionProcessor(type: ConditionType) {
	return (clazz) => {
		ConditionProcessor.processorSettings[type] = clazz;
	}
}

export function createProcessor(condition: Condition) {
	const clazz = ConditionProcessor.processorSettings[condition.type];
	return new clazz(condition);
}

export abstract class ConditionProcessor {

	public static processorSettings:
		{[K: string]: Constructor<ConditionProcessor>} = {};

	public condition: Condition;

	protected constructor(condition: Condition) {
		this.condition = condition;
	}

	/**
	 * 属性声明
	 */
	public get value() { return this.condition.value; }
	public get compare() { return this.condition.compare; }
	public get consumable() { return this.condition.consumable; }
	public get errMsg() { return this.condition.errMsg; }

	protected abstract get playerValue(): number;
	protected abstract get throwFunc(): Function;

	/**
	 * 条件判断
	 */
	public judge() {
		this.preprocess();
		const pValue = this.playerValue;
		switch (this.compare) {
			case "eq": return pValue == this.value;
			case "neq": return pValue != this.value;
			case "gt": return pValue > this.value;
			case "gte": return pValue >= this.value;
			case "lt": return pValue < this.value;
			case "lte": return pValue <= this.value;
			default: return false;
		}
 	}

	/**
	 * 消耗
	 */
	public check() {
		if (!this.judge()) this.throwFunc(this.errMsg);
	}

	/**
	 * 消耗
	 */
	public consume() {
		if (this.consumable) this.doConsume();
	}

	/**
	 * 预处理
	 */
 	protected preprocess() { }

	/**
	 * 执行消耗
	 */
	protected doConsume() { }

}

@conditionProcessor(ConditionType.Func)
class FuncConditionProcessor extends ConditionProcessor {

	protected get playerValue(): number { return 0; }
	protected get throwFunc(): Function { return this.condition.params.throwFunc; }

	judge(): boolean {
		return this.condition.params.jFunc();
	}

}
