
import {getMetaData, isChildClassOf} from "./TypeUtils";

export type Constructor<T = any> = new (...args: any[]) => T;

export abstract class SerializableData {
	onCreated() {}
	public clone(deep = false): this {
		// @ts-ignore
		const type: Constructor<any> = this.constructor;
		return deep ? DataLoader.load(type, DataLoader.convert(this)) :
			Object.assign(new type(), this);
	}
}

class DataLoaderError extends Error {
	protected data;
	protected key;
	protected value;
	protected type;

	constructor(type, value, key = null, data = null) {
		super();
		this.type = type; this.value = value;
		this.key = key; this.data = data;

		this.message = this.getMessage();
	}

	public getMessage() {
		return `数据读取错误：${this.value} 转化为 ${this.type} 时发生异常
		（附加信息：key = ${this.key}，oriData = ${this.data}）`;
	}
}

type DataSetting = {
	default: any
	properties: {
		[K: string]: {
			type: Constructor | Constructor[], default: any
		}
	},
	occasions: {[K: string]: number}
	dataPK: string
}
const DataSettingKey = "setting";

/**
 * 需要序列化的字段
 */
export function field<T>(
	typeOrObj: Constructor<T> | Constructor<T>[] | Object = null,
	key: string | null = null): any {

	// 根据参数判断是否本身就是一个修饰器
	const isDesc = key && (typeof typeOrObj !== 'function');
	// 获取真实的type
	let type = isDesc ? typeOrObj[key]?.constructor : typeOrObj;

	const process = (obj: any, key: string) => {
		const oType = obj.constructor;
		const cache = DataLoader.getSetting(oType);
		cache.default = new oType();
		cache.properties[key] = {
			type, default: cache.default[key]
		}
	}

	if (isDesc) process(typeOrObj, key);
	else return process;
}


/**
 * 见{@link occasion}
 */
export enum DataOccasion {
	Interface = 1,
	Database = 2,
	Cache = 4,
	Extra = 8,
	Default = 16
}

/**
 * 写在标有field的属性上，代表这个属性在序列化或反序列化时需不需要被处理。<p>
 * 例如：<p>
 * | @field<p>
 * | @occasion(DataOccasion.CACHE)<p>
 * | public num: number;
 * 说明只有序列化到缓存里时num才会出现，序列化返回前端和存入数据库时都不会有num这个字段<p>
 * 注意：@occasion( )代表所有场合都不处理！不写occasion修饰器代表全部场合都处理。
 *
 * @param occasions
 */
export function occasion(...occasions: DataOccasion[]) {
	let mask = 0;
	for (let i = 0; i < occasions.length; i++) mask |= occasions[i];

	return (obj: any, key: string) => {
		const cache = DataLoader.getSetting(obj.constructor);
		cache.occasions[key] = mask;
	};
}

/**
 * 业务主键
 */
export function dataPK(obj: any, key: string) {
	const clazz = obj.constructor;
	const setting = DataLoader.getSetting(clazz);
	if (setting.dataPK)
		throw `${clazz.name}重复定义主键！！已有主键：${setting.dataPK}，第二次注明的主键：${key}`;
	setting.dataPK = key;
}

export class DataLoader {

	public static getSetting<T extends SerializableData>(type: Constructor<T>) {
		return getMetaData<DataSetting>(
			type, DataSettingKey, {
				default: new type(),
				properties: {}, occasions: {},
				dataPK: undefined,
			});
	}

	private static getDefault<T extends SerializableData>(type: Constructor<T>) {
		return this.getSetting(type).default;
	}
	private static getProperties<T extends SerializableData>(type: Constructor<T>) {
		return this.getSetting(type).properties;
	}

	// region 读取（反序列化）

	public static load<T extends SerializableData>(
		occasionOrType: DataOccasion | Constructor<T>,
		typeOrData?: Constructor<T> | Partial<T> | string,
		dataOrIndex?: Partial<T> | number,
		indexOrParent?: number | SerializableData,
		parent?: SerializableData) : T {

		// region 解析参数

		let occasion = DataOccasion.Default,
			type: Constructor<T>,
			data: Partial<T>, index: number;

		if (typeof occasionOrType == 'function') {
			type = occasionOrType;
		} else if (occasionOrType) {
			occasion = occasionOrType;
		}

		if (typeof typeOrData == 'object') {
			data = typeOrData;
		} else if (typeof typeOrData == "string" ) {
			data = JSON.parse(typeOrData);
		} else {
			type = typeOrData;
		}

		if (typeof dataOrIndex == 'number') {
			index = dataOrIndex;
		} else if (dataOrIndex) {
			data = dataOrIndex;
		}
		if (typeof indexOrParent == 'object') {
			parent = indexOrParent;
		} else if (indexOrParent != null) {
			index = indexOrParent;
		}

		// endregion
		if (data == null) return null;

		let res = new type(index, parent);

		if (data) {
			const properties = this.getProperties(type);
			for (const key in properties){
				if (key in data && this.matchOccasion(occasion, type, key))
					this.loadProp(occasion, res, key, properties[key], data[key]);
			}

		}
		res.onCreated();
		return res;
	}

	// public static loadFromJSON<T extends SerializableData>(
	// 	occasion: DataOccasion,
	// 	json: object[], type: Constructor<T>) : {[T: string]: SerializableData} {
	//
	// 	if (!json) console.error(json, type);
	//
	// 	let list: T[] = json ? json.map((json) =>
	// 		this.load(occasion, type, json)) : [];
	//
	// 	let res = {};
	// 	list.forEach(d => res[d._id] = d);
	//
	// 	return res;
	// }

	private static loadProp(occasion: DataOccasion, res: SerializableData, key: string, prop, data) {
		try {
			let pType = prop.type || prop.default?.constructor;
			let interceptor = prop.interceptor;

			res[key] = this.loadType(occasion, pType, data, res, interceptor);
		} catch (e) {
			console.error(e, res, key, data, prop);
		}
	}

	private static loadType(occasion: DataOccasion, type, data, parent, interceptor, index?) {
		if (data == null) return null;

		if (type instanceof Array) {
			this.ensureType(Array, data);

			let eType = type[0]; // 元素类型
			return data.map((d, idx) => {
				if(eType.interceptor)
					eType = interceptor(data); // 根据data判断拦截具体类型
				return this.loadType(occasion, eType, d, parent, null, idx)
			});
		}

		this.ensureType(type, data);
		return isChildClassOf(type, SerializableData) ?
			this.load(occasion, type, data, index, parent) : data;
	}

	private static ensureType(type, data) {
		if (!type) return;

		const isData = isChildClassOf(type, SerializableData);
		if (isData && data.constructor != Object)
			throw new DataLoaderError(type, data);

		if (!isData && type != data.constructor)
			throw new DataLoaderError(type, data);
	}

	// endregion

	// region 转化（序列化）

	public static convert<T extends SerializableData>(
		occasionOrTypeOrData: DataOccasion | Constructor<T> | any,
		typeOrData?: Constructor<T> | any,
		data?: any): string {

		// region 解析参数
		let occasion = DataOccasion.Default,
			type: Constructor<T>;

		if (typeof occasionOrTypeOrData == 'function') {
			type = occasionOrTypeOrData;
			data = typeOrData;
		} else if (typeof occasionOrTypeOrData == 'object') {
			data = occasionOrTypeOrData;
			if (data instanceof SerializableData)
				type = data.constructor as Constructor<T>;
		} else if (occasionOrTypeOrData) { // 传入Occasion的情况
			occasion = occasionOrTypeOrData;
			if (typeof typeOrData == 'function') {
				type = typeOrData;
			} else if (typeOrData) {
				data = typeOrData;
				if (data instanceof SerializableData)
					type = data.constructor as Constructor<T>;
			}
		}
		// endregion

		if (!data) return null;

		const res = {};
		if (type) { // 赋值 type
			const properties = this.getProperties(type);
			for (const key in properties){
				if (key in data && this.matchOccasion(occasion, type, key))
					this.convertProp(occasion, res, key, properties[key], data[key]);
			}


		} else { // 没有赋值 type
			const keys = Object.keys(data);
			for (const key of keys)
				this.convertProp(occasion, res, key, null, data[key]);
		}

		return JSON.stringify(res);
	}

	private static convertProp(occasion: DataOccasion,
														 res: object, key: string, prop, data) {
		try {
			let pType = prop?.type || prop?.default?.constructor || data?.constructor;

			res[key] = this.convertType(occasion, pType, data);
		} catch (e) {
			console.error(e, res, key, data, prop);
		}
	}

	private static convertType(occasion: DataOccasion,
														 type, data) {
		if (data == null) return null;

		if (type instanceof Array)
			// this.ensureType(Array, data); // Convert不需要保证类型
			return data.map(d => this.convertType(occasion, type[0], d));

		// this.ensureType(type, data); // Convert不需要保证类型
		return isChildClassOf(type, SerializableData) ?
			this.convert(occasion, data) : data;
	}

	// endregion

	private static matchOccasion(occasion: DataOccasion,
															 type: Constructor, key: string) {
		const setting = this.getSetting(type);
		// 如果没有指定occasions，表示所有场合皆可序列化
		// 否则，判断指定场合是否匹配
		return !setting.occasions[key] ||
			(setting.occasions[key] & occasion) != 0;
	}

}



// interface ElemTypeMapping {
// 	[ElementType.linear]: Line;
// 	[ElementType.freedraw]: FreeDraw;
// 	[ElementType.text]: TextElement;
// 	[ElementType.generic]: GenericElement;
// }




