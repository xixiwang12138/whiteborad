import {BaseManager, getManager, manager} from "./BaseManager";
import {isChildClassOf} from "../../../utils/TypeUtils";
import {BaseData} from "../data/BaseData";
import {DataLoader, DataOccasion} from "../data/DataLoader";
import {Constructor} from "../BaseContext";

export function storageMgr() {
	return getManager(StorageManager);
}

@manager
class StorageManager extends BaseManager {

	private cache = {}

	public getData<T>(key: string, clazz?: Constructor<T>) {
		if (!this.cache[key]) {
			let res = wx.getStorageSync(key);
			console.log("GetStorage: ", key, res);

			try {
				res = JSON.parse(res);
			} catch (e) {
				console.error("JSON Parse Error", e, res);
				res = null;
			}
			if (res && isChildClassOf(clazz, BaseData))
				res = DataLoader.load(DataOccasion.Cache, clazz, res);

			console.log("Get: ", key, res);
			this.cache[key] = res;
		}
		return this.cache[key];
	}

	public setData<T>(key: string, val: any, clazz?: Constructor<T>) {
		this.cache[key] = val;
		console.log("Set: ", key, val);

		if (val == null)
			return wx.setStorageSync(key, null);

		if (typeof val == 'object') {
			clazz ||= val.constructor;
			val = DataLoader.convert(DataOccasion.Cache, clazz, val);
		}

		console.log("SetStorage: ", key, val);
		return wx.setStorageSync(key, JSON.stringify(val));
	}

}
