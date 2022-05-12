import {DataLoader, field} from "./DataLoader";
import {DateUtils} from "../../../utils/DateUtils";

export type PK = string;
export function pkType() { return String; }

export class BaseData  {

	public index?: number = null; // 下标（非必要）

	constructor(index?: number) {
		this.index = index;
	}

	onCreated?() {}

	toJSON?() { return DataLoader.convert(this); }
}

export class MainData extends BaseData {

	@field(pkType())
	public _id: PK;

}

export function ifState<T>(...statuses: T[]) {
	return (obj, key, desc) => {
		const oriFunc = desc.value;
		desc.value = async function(...p) {
			if (this.isStatus(...statuses))
				return await oriFunc.apply(this, p);
		}
	}
}
export function ensureState<T>(throw_: Function | string, ...statuses: T[]) {
	return (obj, key, desc) => {
		const oriFunc = desc.value;
		desc.value = async function(...p) {
			if (!this.isStatus(...statuses))
				if (throw_ instanceof Function) throw_()
				else throw throw_;
			else return await oriFunc.apply(this, p);
		}
	}
}

export class StateData<T> extends MainData {

	@field
	public state: T;
	@field(Number)
	public stateTime?: number;
	@field(String)
	public stateDesc?: string;

	/**
	 * 状态变更时间文本
	 */
	public get statusTimeStr() {
		return DateUtils.time2Str(this.stateTime);
	}

	// region 状态控制

	/**
	 * 更改状态
	 */
	public changeStatus(status: T, desc?: string) {
		this.state = status;
		this.stateTime = Date.now();
		this.stateDesc = desc;
	}

	/**
	 * 判断状态
	 * @param states
	 */
	public isState(...states: T[]) {
		return states.includes(this.state);
	}

	// endregion
}
