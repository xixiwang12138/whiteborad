import {MainData, PK} from "./BaseData";
import {dataMgr} from "../managers/DataManager";
import {getSingleton, singleton} from "../../../utils/SingletonUtils";
import {BaseContext, Constructor} from "../BaseContext";

@singleton
export class RepositoryContext extends BaseContext<BaseRepository<any>> {

	get contentName(): string { return "Repository"; }

}

function repositoryContext() {
	return getSingleton(RepositoryContext);
}

export function repository<T extends BaseRepository<any>>(
	clazz: Constructor<T>) {
	repositoryContext().create(clazz, new clazz());
	return clazz;
}

export function getRepository<T extends BaseRepository<any>>(
	clazz: Constructor<T>) {
	return repositoryContext().instance(clazz);
}

export function filterKeys<T = any>(...keys: (keyof T)[]) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		clazz["defaultKeys"] ||= {};

		clazz["defaultKeys"][key] = keys;
	}
}

export function throwMessage(
	throwFuncOrErrMsg: Function | string, detail?: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		clazz["throwFuncs"] ||= {};

		clazz["throwFuncs"][key] = () => {
			if (typeof throwFuncOrErrMsg == "string")
				throw throwFuncOrErrMsg;
			else
				throwFuncOrErrMsg(detail);
		}
	}
}

export type AutoMatchType = "find" | "findOne" |
	"get" | "getOne" | "exist" | "count" | "ensure" | "ensureNot";

const DefaultThrowFunc = () => {throw null};

export abstract class BaseRepository<T extends MainData> {

	public abstract get clazz(): Constructor<T>;

	// region 预设函数

	public get list() {
		return dataMgr().getDataList(this.clazz);
	}

	public doc(id: PK) {
		return dataMgr().getDataById(this.clazz, id);
	}

	public find(filter: Partial<T> = {}) {
		return this.list.filter(item =>
			Object.keys(filter).every(key =>
				item[key] == filter[key])
		);
	}
	public findOne(filter: Partial<T> = {}) {
		return this.list.find(item =>
			Object.keys(filter).every(key =>
				item[key] == filter[key])
		);
	}

	public getOne(filter: Partial<T> = {},
											throwFunc: Function = DefaultThrowFunc) {
		const res = this.findOne(filter);
		// 找不到，抛出异常。如果没有用throwMessage修饰，需要在外部通过catchAsError接收
		if (res == null) throwFunc();
		return res;
	}
	// @throwMessage("找不到指定ID的数据")
	public getById(id: PK) {
		return this.getOne({_id: id} as any);
	}

	public count(filter: Partial<T> = {}) {
		return this.find(filter).length;
	}
	public exist(filter: Partial<T> = {}) {
		return this.count(filter) > 0;
	}

	public ensure(filter: Partial<T> = {},
											throwFunc: Function = DefaultThrowFunc) {
		if (!this.findOne(filter)) throwFunc();
	}
	public ensureNot(filter: Partial<T> = {},
												 throwFunc: Function = DefaultThrowFunc) {
		if (this.findOne(filter)) throwFunc();
	}

	// endregion

	protected constructor() {
		this.processFuncs();
	}

	private processFuncs() {
		const proto = this.constructor.prototype;
		const fNames = Object.getOwnPropertyNames(proto);

		fNames.forEach(fName => this.processFunc(fName));
	}

	/**
	 * 处理函数
	 */
	private processFunc(name: string) {
		const newFunc = this.getNewFunc(name);
		newFunc && (this[name] = newFunc);
	}

	private getNewFunc(name: string) {
		// 获取需要查询的键
		const keys = this.getKeysFromName(name);

		// 根据指定条件查询
		if (name.startsWith("findOne")) // 查找一个
			return this.getFindOneFunc(name, keys);
		if (name.startsWith("find")) // 查找多个
			return this.getFindFunc(name, keys);
		if (name.startsWith("get")) // 查找一个，查不到会报错
			return this.getGetOneFunc(name, keys);

		if (name.startsWith("count")) // 计数
			return this.getCountFunc(name, keys);
		if (name.startsWith("exist")) // 是否存在
			return this.getExistFunc(name, keys);

		if (name.startsWith("ensure")) // 确保存在，不存在会报错
			return this.getEnsureFunc(name, keys);
		if (name.startsWith("ensureNot")) // 确保不存在，不存在会报错
			return this.getEnsureNotFunc(name, keys);

		return null;
	}

	private getKeysFromName(name) {
		const keys = this.constructor["defaultKeys"];
		const res = keys ? keys[name] : null;
		return res || this.analyseByClause(name);
	}
	private analyseByClause(name: string) {
		const strs = name.split("By");
		return strs[1]?.split("And") || [];
	}
	private makeFilter(keys: string[], ...p) {
		const res = {};
		keys.forEach((key, i) =>
			res[this.convertKey(key)] = p[i]);
		return res as Partial<T>;
	}
	private convertKey(key) {
		return key.charAt(0).toLowerCase() + key.slice(1);
	}

	private getFindFunc(name, keys) {
		return (...p) => this.find(this.makeFilter(keys, ...p));
	}
	private getFindOneFunc(name, keys) {
		return (...p) => this.findOne(this.makeFilter(keys, ...p));
	}
	private getGetOneFunc(name, keys) {
		const throwFunc = this.getThrowFunc(name);
		return (...p) => this.getOne(
			this.makeFilter(keys, ...p), throwFunc);
	}

	private getCountFunc(name, keys) {
		return (...p) => this.count(this.makeFilter(keys, ...p));
	}
	private getExistFunc(name, keys) {
		return (...p) => this.exist(this.makeFilter(keys, ...p));
	}

	private getEnsureFunc(name, keys) {
		const throwFunc = this.getThrowFunc(name);
		return (...p) => this.ensure(
			this.makeFilter(keys, ...p), throwFunc);
	}
	private getEnsureNotFunc(name, keys) {
		const throwFunc = this.getThrowFunc(name);
		return (...p) => this.ensureNot(
			this.makeFilter(keys, ...p), throwFunc);
	}

	private getThrowFunc(name): Function {
		const funcs = this.constructor["throwFuncs"];
		const res = funcs ? funcs[name] : null;
		return res || (() => {
			console.error(this, name);
			throw "Get/Ensure失败"
		});
	}

}
