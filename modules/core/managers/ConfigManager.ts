import {BaseConfig} from "../Data/BaseConfig";
import {BaseManager, getManager, manager} from "./BaseManager";
import {Constructor} from "../BaseContext";
import {DataLoader} from "../data/DataLoader";
import {get, Itf} from "../BaseAssist";
import {PromiseUtils} from "../../../utils/PromiseUtils";

const GetConfig: Itf<{}, {[T: string]: BaseConfig[]}>
	= get("/core/config/get");

export function waitForConfigLoad(obj, key, desc) {
	const oriFunc = desc.value;
	desc.value = async function (...p) {
		await PromiseUtils.waitFor(() => configMgr().isLoaded);
		return await oriFunc.apply(this, p);
	}
}

export function configMgr() {
	return getManager(ConfigManager)
}

type ConfigCache<T extends BaseConfig> = {
	clazz: Constructor<T>, name: string, config?: T
}

const ClazzConfigKey = "configName";

@manager
export class ConfigManager extends BaseManager {

	public configs: {[T: string]: ConfigCache<any>} = {};

	public isLoaded = false;

	/**
	 * 初始化
	 */
	constructor() {
		super();
		this._initializeData().then();
	}
	private async _initializeData() {
		this.isLoaded = false;

		const res = await GetConfig();
		for (const key in this.configs) {
			const cache = this.configs[key];
			this.configs[key].config = DataLoader.load(
				cache.clazz, res.configs[key]);
		}

		this.isLoaded = true;
	}

	// region 配置操作

	public registerConfig<T extends BaseConfig>(
		clazz: Constructor<T>, name: string) {
		clazz[ClazzConfigKey] = name;

		this.configs[name] = { clazz, name };
	}
	public getConfigCache<T extends BaseConfig>(
		clazz: Constructor<T> | string): ConfigCache<T> {
		if (typeof clazz !== 'string')
			clazz = clazz[ClazzConfigKey] as string;

		return this.configs[clazz];
	}

	/**
	 * 获取集合
	 * @param clazz
	 */
	public config<T extends BaseConfig>(clazz: Constructor<T> | string) {
		const config = this.getConfigCache(clazz);
		return config.config ||= new config.clazz();
	}

	// endregion

}
