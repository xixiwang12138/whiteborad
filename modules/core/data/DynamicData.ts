import {MainData} from "./BaseData";

export abstract class DynamicData extends MainData {

	public get syncAble() { return true; }
	public get removeAble() {  return false; }

	// public sync() : undefined | Promise<SyncResult>;
	// public remove() : undefined | Promise<RemoveResult>;

	/**
	 * 业务主键
	 */
	public get dataId(): string {
		// @ts-ignore
		return this[DataLoader.getDataPK(this.constructor)];
	}

}
