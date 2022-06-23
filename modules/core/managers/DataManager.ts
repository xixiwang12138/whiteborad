
// function data<T extends MainData>(
// 	clazz: Constructor<T>, path: string = null) {
// 	return (target: DataManager, key) => {
// 		// @ts-ignore
// 		target.database ||= {};
// 		// @ts-ignore
// 		target.database[key] = {
// 			clazz, path: path || key
// 		};
// 	}
// }

import {BaseData, MainData, PK} from "../data/BaseData";
import {Constructor} from "../BaseContext";
import {PromiseUtils} from "../../../utils/PromiseUtils";
import {BaseManager, getManager, manager} from "./BaseManager";
import {get, Itf} from "../BaseAssist";
import {DataLoader, DataOccasion} from "../data/DataLoader";

const GetData: Itf<{}, {[T: string]: BaseData[]}>
	= get("/core/data/get");

const ClazzDataKey = "dataName";

export function dataClass<T extends MainData>(name: string): any {
	return (clazz: Constructor<T>) => {
		dataMgr().registerData(clazz, name).then();
	}
}

export function dataGetter<T extends MainData>(
	clazz: Constructor<T> | string) {
	return (target, key, desc) => {
		const ori = desc.value;
		desc.value = function(val = null, dataKey: string = "_id") : T {
			if (val == null) val = ori.call(this)
			if (val == null) val = this[key + 'Id'];
			if (val == null) val = this[key + 'Idx'];
			if (val instanceof Function) val = val.call(this);

			return dataMgr().getData(clazz, val, dataKey);
		}
	}
}
export function waitForDataLoad(obj, key, desc) {
	const oriFunc = desc.value;
	desc.value = async function (...p) {
		await PromiseUtils.waitFor(() => dataMgr().loadingProgress() >= 1);
		return await oriFunc.apply(this, p);
	}
}

export function dataMgr() : DataManager {
	return getManager(DataManager);
}

@manager
class DataManager extends BaseManager {

	/**
	 * 数据库（内部处理用）
	 */
	private database: {[T1: string]: {
			clazz: Constructor<any>, name: string,
			data: {[T2: string]: MainData}
		}} = {};
	private dataLoaded = false;

	/**
	 * 初始化
	 */
	constructor() {
		super();
		this._initializeData().then();
	}
	private async _initializeData() {
		this.dataLoaded = false;

		const data = (await GetData()).data;

		for (const key in this.database) {
			const item = this.database[key];
			item.data = DataLoader.loadFromJSON(
				DataOccasion.Database,
				data[item.name], item.clazz);
		}
		console.log("Database: ", this.database);
		this.dataLoaded = true;
	}

	/**
	 * 注册数据
	 */
	public async registerData<T extends MainData>(
		clazz: Constructor<T>, name: string) {
		clazz[ClazzDataKey] = name;

		this.database[clazz[ClazzDataKey]] = {
			clazz, name, data: {}
				// await DataLoader.loadFromAssetBundle(
				// 	BundleName.Data, path, clazz)
		};
	}

	/**
	 * 数据获取
	 */
	public getData<T extends MainData>(
		clazz: Constructor<T> | string,
		val: any, dataKey: string = "_id") : T {
		if (dataKey != "_id")
			return this.getDataList(clazz)
				.find(d => d[dataKey] == val);

		return typeof val === 'string' ?
			this.getDataById(clazz, val) :
			this.getDataByIndex(clazz, val);
	}
	public getDataByIndex<T extends MainData>(
		clazz: Constructor<T> | string, idx: number) : T {
		return this.getDataList(clazz)[idx];
	}
	public getDataById<T extends MainData>(
		clazz: Constructor<T> | string, id: PK) : T {
		return this.getDataDict(clazz)[id];
	}
	public getDataList<T extends MainData>(
		clazz: Constructor<T> | string) : T[] {
		const dict = this.getDataDict(clazz);
		return Object.values(dict);
	}
	public getDataDict<T extends MainData>(
		clazz: Constructor<T> | string) : Object {
		if (typeof clazz !== 'string')
			clazz = clazz[ClazzDataKey] as string;
		return this.database[clazz].data;
	}

	/**
	 * 所有数据
	 */
	public allData(): MainData[] {
		let res = [];
		for (const key in this.database)
			res = res.concat(Object.values(this.database[key].data));
		return res;
	}

	/**
	 * 读取进度
	 */
	public loadingProgress() {
		return this.dataLoaded ? 1 : 0;

		// if (!this.dataLoaded) return 0;
		//
		// let data = this.allData();
		// return data.reduce((res, e) =>
		// 	res + (e.isLoaded ? 1 : 0), 0) / data.length;
	}

}
