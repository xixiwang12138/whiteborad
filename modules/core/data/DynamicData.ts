import {BaseData, MainData} from "./BaseData";
import {Itf} from "../BaseAssist";


export abstract class DynamicData extends MainData {

	/**
	 * 业务主键
	 */
	public get dataId(): string {
		// @ts-ignore
		return this[DataLoader.getDataPK(this.constructor)];
	}

}

