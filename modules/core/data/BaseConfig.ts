import {BaseData} from "./BaseData";
import {configMgr} from "../managers/ConfigManager";
import {Constructor} from "../BaseContext";

export function config<T extends BaseConfig>(name: string) {
	return (clazz: Constructor<T>) => {
		configMgr().registerConfig(clazz, name);
	}
}

/**
 * 基础配置数据
 */
export abstract class BaseConfig extends BaseData {}
