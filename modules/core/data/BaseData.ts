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

	toJSON?() {
		return DataLoader.convert(this);
	}
}

export class MainData extends BaseData {

	@field(pkType())
	public _id: PK;

}

export function ifStatus<T>(...statuses: T[]) {
	return (obj, key, desc) => {
		const oriFunc = desc.value;
		desc.value = async function(...p) {
			if (this.isStatus(...statuses))
				return await oriFunc.apply(this, p);
		}
	}
}
export function ensureStatus<T>(throw_: Function | string, ...statuses: T[]) {
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

export class StatusData<T> extends MainData {

	@field
	public status: T;
	@field(Number)
	public statusTime: number;
	@field(String)
	public statusDesc: string;

	/**
	 * 状态变更时间文本
	 */
	public get statusTimeStr() {
		return DateUtils.time2Str(this.statusTime);
	}

	// region 状态控制

	/**
	 * 更改状态
	 */
	public changeStatus(status: T, desc?: string) {
		this.status = status;
		this.statusTime = Date.now();
		this.statusDesc = desc;
	}

	/**
	 * 判断状态
	 * @param statuses
	 */
	public isStatus(...statuses: T[]) {
		return statuses.includes(this.status);
	}

	// endregion
}
