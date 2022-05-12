import {MainData} from "./BaseData";
import {dataMgr} from "../managers/DataManager";
import {Constructor} from "../BaseContext";
import {dataPK, field} from "./DataLoader";

export function data<T extends MainData>(name: string): any {
	return (clazz: Constructor<T>) => {
		dataMgr().registerData(clazz, name).then();
	}
}

export abstract class StaticData extends MainData {

	@field @dataPK
	public id: number = -1;
	@field(String)
	public displayName: string = null;

	/**
	 * 业务主键
	 */
	public get dataId(): number { return this.id }

	/**
	 * 多语言键（默认使用类名）
	 */
	public get languageKey(): string {
		// @ts-ignore
		return dataMgr().getDataName(this.constructor);
	}

	/**
	 * 实际显示名称
	 */
	public getDisplayName() {
		return this.displayName || `\\L[${this.languageKey + this.id}]`;
	}

}
