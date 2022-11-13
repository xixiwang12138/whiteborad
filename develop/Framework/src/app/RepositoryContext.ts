import {Constructor} from "../utils/SingletonUtils";
import {BaseContext} from "./BaseContext";
import {repositoryContext} from "./App";
import {dataPK, MainData} from "../modules/coreModule/data/BaseData";
import {DataCollection, DBData, Op} from "../modules/coreModule/utils/DataCollection";
import {Filter, UpdateFilter} from "mongodb";
import {dataMgr} from "../modules/coreModule/managers/DataManager";
import {isChildClassOf} from "../utils/TypeUtils";
import {DataLoader} from "../modules/coreModule/utils/DataLoader";
import {Config} from "../configs/Config";
import {Mutex} from "async-mutex";
import {test} from "../modules/coreModule/managers/TestManager";
import {cache} from "../utils/DecoratorUtils";
import {redisMgr} from "../modules/coreModule/managers/RedisManager";
import {ObjectUtils} from "../utils/ObjectUtils";

const REPO_KEY = "__exermonRepo__";

const FilterKey = "defaultKeys";
const FromCacheKey = "fromCache";
const ThrowKey = "throwFuncs";

export class RepositoryContext extends BaseContext<BaseRepository<any>> {

	get contentName(): string { return "Repository"; }

	static imageCacheEnable?: boolean = false; //是否需要将缓存存入复制的redis中  //TODO 这里设置为静态内容，不确定是否正确

	// @test
	public async initialize() {
		for (const repo of this.list) await repo.initialize();
		console.log(`[Repo Initialized]`);
	}

	// @test
	public async redisSync() {
		for (const repo of this.list) await repo.redisSync();
		console.log(`[Repo RedisSynced]`);
	}

	// @test
	public async dbSync() {
		for (const repo of this.list) await repo.dbSync();
		console.log(`[Repo DbSynced]`);
	}

}

export function repository<T extends BaseRepository<any>>(
	clazz: Constructor<T>) {
	const instance = repositoryContext().create(clazz);
	instance.clazz[REPO_KEY] = {clazz, instance};
	return clazz;
}

export function getRepository
<T extends BaseRepository<D>, D extends MainData>(
	clazz: Constructor<T> | Constructor<D> | string): T {
	return isChildClassOf(clazz, MainData) ? clazz[REPO_KEY].instance :
		repositoryContext().instance(clazz as Constructor<T>);
}

export function fromCache(obj, key, desc) {
	const clazz = obj.constructor;
	clazz[FromCacheKey] ||= {};

	clazz[FromCacheKey][key] = true;

	// const oriFunc = desc.value;
	// desc.value = function(...p) {
	// 	try {
	// 		this.cacheOnly = true;
	// 		return oriFunc.apply(this, p);
	// 	} finally {
	// 		this.cacheOnly = false;
	// 	}
	// }
}

export function filterKeys<T = any>(...keys: (keyof T)[]) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		clazz[FilterKey] ||= {};

		clazz[FilterKey][key] = keys;
	}
}

export function throwMessage(
	throwFuncOrErrMsg: Function | string, detail?: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		clazz[ThrowKey] ||= {};

		clazz[ThrowKey][key] = () => {
			if (typeof throwFuncOrErrMsg == "string")
				throw throwFuncOrErrMsg;
			else
				throwFuncOrErrMsg(detail);
		}
	}
}

export type AutoMatchType = "find" | "findOne" |
	"get" | "getOne" | "exist" | "count" | "ensure" | "ensureNot" |
	"deleteOne" | "deleteMany" | "delete";

export const DefaultThrowFunc = (data) => {
	console.error(data);
	throw "Ensure/Get Error!"
};

export type F<T extends MainData> = Filter<DBData<T>>;
export type U<T extends MainData> = UpdateFilter<DBData<T>> | Partial<DBData<T>>;

export abstract class BaseRepository<T extends MainData> {

	public abstract get clazz(): Constructor<T>;

	public constructor() {
		this.processFuncs();
	}

	/**
	 * 数据库实例
	 */
	public get db(): DataCollection<T> {
		return dataMgr().collection<T>(this.clazz);
	}

	/**
	 * 业务主键名称
	 */
	protected get dataPK() {
		return DataLoader.getDataPK(this.clazz);
	}

	// region 初始化

	/**
	 * 初始化
	 */
	public async initialize() {}

	/**
	 * 缓存同步
	 */
	public async redisSync() {}

	/**
	 * 数据库同步
	 */
	public async dbSync() {}

	// endregion

	// region 工厂函数

	/**
	 * 创建实例（自动插入）
	 */
	public create(...p) {
		const res = this.tempCreate(...p);
		const ins = this.insertOne(res);
		return ins instanceof Promise ? ins.then(() => res) : res;
	}

	/**
	 * 创建实例（临时）
	 */
	public tempCreate(...p) {
		const createFunc = this.clazz.create;
		if (createFunc) return createFunc(...p);
		return new this.clazz();
	}

	// endregion

	// region 缓存系统

	/**
	 * 缓存
	 */
	protected cache: {[K: string]: T} & {[K: number]: T} = {}

	/**
	 * 只获取缓存
	 */
	private _cacheOnly: boolean = false;

	/**
	 * 是否启用缓存
	 */
	public get cacheEnable() { return Config.cache.cacheEnable; }


	/**
	 * 当前filter是否使用缓存
	 */
	protected cacheOnly(filter: F<T> = {}) {
		return this.cacheEnable && (
			this._cacheOnly || !!this.getDataIfPK(filter))
	}

	/**
	 * 清空缓存
	 */
	public clearCache() {}

	/**
	 * 持久化后清空缓存
	 */
	public persistenceAndSafeClearCache() {}

	/**
	 * 缓存列表
	 */
	public get cacheList(): T[] { return Object.values(this.cache); }

	/**
	 * 缓存数据（重复的不会覆盖）
	 */
	public saveOneToCache(data: T, force = false) {
		if (!this.cacheEnable) return data;

		//_id存在就是从数据库中查询的数据,需要进行复制到redis中，这份redis的复制镜像的数据与数据库中原始的数据保持一致
		if(data && data._id != null && RepositoryContext.imageCacheEnable == true){
			redisMgr().setData(this.clazz.name + "_"+"image", data.dataId.toString(), data);
		}

		return data && (force ?
			this.cache[data.dataId] = data :
			this.cache[data.dataId] ||= data);
	}

	/**
	 * 缓存列表（如果有重复的，不会覆盖）
	 */
	public saveToCache(list: T[], force = false) {
		if (!this.cacheEnable) return list;

		for (let i = 0; i < list.length; i++)
			list[i] = this.saveOneToCache(list[i], force);
		return list;
	}

	/**
	 * 查找缓存列表
	 */
	public findFromCache(filter: F<T> = {}) {
		if (!this.cacheEnable) return [];

		const data = this.getDataIfPK(filter);
		if (data) // 如果查询条件中包含业务主键，且有缓存
			// 如果有缓存，则判断其他条件是否符合，如果符合，则数组形式返回，否则返回空数组
			return this.filterFunc(filter)(data) ? [data] : [];

		return Object.keys(filter).length <= 0 ? this.cacheList.slice()
			: this.cacheList.filter(this.filterFunc(filter));
	}

	/**
	 * 处理safe-mode过程中的发生的更改
	 */
	public async processChanges() {
		let manyDataFromImage = await redisMgr().getAllData(this.clazz, this.clazz.name + "_image");
		if (manyDataFromImage.length == 0) {  //镜像中没有数据，说明期间没有查询数据库的操作，不会产生数据的不一致性
			return;
		}
		// let keysFromImage: string[] = Object.keys(manyDataFromImage);
		// 镜像中的数据与数据库中最原始的数据保持一致

		for (const image of manyDataFromImage) {
			const key = image[this.dataPK];
			// @ts-ignore
			const cacheData = await this.findOneFromCacheByPK(key);  // TODO: 为空？
			// @ts-ignore
			const dbData = await this.findOneFromDB(({[this.dataPK]: key}));
			// 以下结果存储更改的字段以及他们对应的两个属性值
			let cacheAndImage = ObjectUtils.findDiffProps(cacheData, image);
			let dbAndImage = ObjectUtils.findDiffProps(dbData, image);

			//数据库的所有更改先同步到缓存
			for (const prop of dbAndImage) {
				const val = prop.diff.o1;
				eval("cacheData"+ prop.key+" = val");
			}

			//求交集，用户更改的缓存和更改数据库同时发生的属性的集合
			const intersect = Object.keys(cacheAndImage).filter(item => {
				return Object.keys(dbAndImage).includes(item)
			});

			if (intersect.length != 0) {
				//存在冲突，需要保留用户产生的缓存数据，舍弃数据库直接的更改
				for (const propName of intersect) {
					for (const prop of cacheAndImage) {
						if(prop.key === propName){
							const val = prop.diff.o1;
							eval("cacheData"+ prop.key+" = val");  //将用户产生的数据恢复到缓存
							break;
						}
					}

				}
			}
		}

		//将redis副本中所有缓存清除
		redisMgr().removeAllData(this.clazz.name+"_image");
	}


	/**
	 * 通过业务主键进行从缓存中查找
	 */
	public async findOneFromCacheByPK(key: string){
		// @ts-ignore
		return this.findOneFromCache({ [this.dataPK] : key });
	}


	/**
	 * 查找单个缓存
	 */
	public findOneFromCache(filter: F<T> = {}) {
		return this.findFromCache(filter)[0];
	}

	/**
	 * 删除多个缓存
	 */
	public deleteFromCache(filter: F<T> = {}) {
		if (!this.cacheEnable) return;

		const items = this.cacheList.filter(this.filterFunc(filter));
		// TODO: 置为null的是已删除的项，同步时需要注意
		items.forEach(data => this.cache[data.dataId] = null);
	}

	/**
	 * 删除单个缓存
	 */
	public deleteOneFromCache(filter: F<T> = {}) {
		if (!this.cacheEnable) return false;

		const item = this.cacheList.find(this.filterFunc(filter));
		// TODO: 置为null的是已删除的项，同步时需要注意
		item && (this.cache[item.dataId] = null);
		return !!item // 表示是否有删除到
	}

	/**
	 * 移除多个缓存（移除只是从缓存中移除，不会留下删除标记）
	 */
	public removeFromCache(filter: F<T> = {}) {
		if (!this.cacheEnable) return;

		const items = this.cacheList.filter(this.filterFunc(filter));
		items.forEach(data => delete this.cache[data.dataId]);
	}

	/**
	 * 移除单个缓存（移除只是从缓存中移除，不会留下删除标记）
	 */
	public removeOneFromCache(filter: F<T> = {}) {
		if (!this.cacheEnable) return false;

		const item = this.cacheList.find(this.filterFunc(filter));
		item && (delete this.cache[item.dataId]);
		return !!item // 表示是否有移除到
	}

	/**
	 * 更新多个缓存
	 */
	public updateFromCache(filter: F<T> = {}, update: U<T> = {}) {
		if (!this.cacheEnable) return;

		this.cacheList.filter(this.filterFunc(filter))
			.forEach(data => Object.keys(update).forEach(
				key => key in data && (data[key] = update[key])));
	}

	/**
	 * 更新单个缓存
	 */
	public updateOneFromCache(filter: F<T> = {}, update: U<T> = {}) {
		if (!this.cacheEnable) return false;

		const item = this.cacheList.find(this.filterFunc(filter));
		item && Object.keys(update).forEach(key =>
			key in item && (item[key] = update[key]));
		return !!item // 表示是否有更新到
	}

	/**
	 * 工具函数
	 */
	private getDataIfPK(filter: F<T> = {}): T {
		return this.cacheEnable && this.cache[filter[this.dataPK]];
	}

	/**
	 * 过滤函数
	 */
	protected filterFunc(filter: F<T> = {}) {
		return item => Object.keys(filter)
			.every(key => {
				if (!item) return false;
				const fObj = filter[key], val = item[key];
				if (typeof fObj == "object") { // 特殊查询语句
					let res = true;
					if ("$eq" in fObj) res &&= val == fObj.$eq;
					if ("$ne" in fObj) res &&= val != fObj.$ne;
					if ("$gt" in fObj) res &&= val > fObj.$gt;
					if ("$gte" in fObj) res &&= val >= fObj.$gte;
					if ("$in" in fObj) res &&= fObj.$in.includes(val);
					if ("$lt" in fObj) res &&= val < fObj.$lt;
					if ("$lte" in fObj) res &&= val <= fObj.$lte;
					if ("$nin" in fObj) res &&= !fObj.$nin.includes(val);

					// TODO: 其他待补充

					return res;
				} else return val == fObj
			})
	}

	// endregion

	// region 数据库操作

	/**
	 * 从数据库中查询
	 */
	public findFromDB(filter: F<T> = {}, force = false) {
		// const cacheRes = this.cacheEnable ? this.findFromCache(filter) : [];
		// return this.db.find(filter).toArray()
		// 	.then(res => {
		// 		res = this.saveToCache(res);
		// 		cacheRes.forEach(data => !res.includes(data) && res.push(data));
		// 		return res;
		// 	});

		return this.db.find(filter).toArray().then(res => this.saveToCache(res, force));
	}

	/**
	 * 从数据库中查询单个
	 */
	public findOneFromDB(filter: F<T> = {}) {
		// const cacheRes = this.cacheEnable ? this.findOneFromCache(filter) : null;
		return this.db.findOne(filter).then(res => this.saveOneToCache(res));
	}

	/**
	 * 从数据库中计数
	 */
	public countFromDB(filter: F<T> = {}) {
		return this.db.find(filter).count();
	}

	/**
	 * 从数据库中插入多个数据
	 */
	public insertManyToDB(docs: T[]) {
		return this.db.insertMany(docs);
	}

	/**
	 * 从数据库中插入单个数据
	 */
	public insertOneToDB(data: T) {
		return this.db.insertOne(data);
	}

	/**
	 * 从数据库中删除单个
	 */
	public deleteOneFromDB(filter: F<T> = {}) {
		return this.db.deleteOne(filter);
	}

	/**
	 * 从数据库中删除多个
	 */
	public deleteManyFromDB(filter: F<T> = {}) {
		return this.db.deleteMany(filter);
	}

	/**
	 * 从数据库中更新单个
	 */
	public updateOneToDB(filter: T | F<T>, update: U<T>) {
		return this.db.updateOne(filter, Op.Set, update);
	}

	/**
	 * 从数据库中更新多个
	 */
	public updateManyToDB(filter: F<T>, update: U<T>) {
		return this.db.updateMany(filter, Op.Set, update);
	}

	// endregion

	// region 预设函数

	/**
	 * 获取指定数据库主键数据
	 */
	// public doc(id: PK) {
	// 	const res = this.cacheList.find(val => val._id?.equals(id));
	// 	return res || this.cacheOnly ? res :
	// 		this.db.doc(id).then(res => this.saveOneToCache(res));
	// }

	/**
	 * 查询多个数据
	 */
	public find(filter: F<T> = {}) {
		// 获取多个数据，首先先查询缓存
		const cacheRes = this.findFromCache(filter);
		if (this.cacheOnly(filter)) return cacheRes; // 如果只用缓存数据

		// 否则，正常获取数据库数据
		return this.findFromDB(filter)
			.then(res => { // 将获取到的结果与缓存获取的结果合并
				cacheRes.forEach(d => !res.includes(d) && res.push(d));
				return res;
			})

		// return this.db.find(filter).toArray()
		// 	.then(res => this.saveToCache(res));
	}

	/**
	 * 查询单个数据
	 */
	public findOne(filter: F<T> = {}) {
		// 如果缓存中有满足条件的，直接获取，否则获取数据库
		const cacheRes = this.findOneFromCache(filter);
		if (cacheRes || this.cacheOnly(filter)) return cacheRes; // 如果只用缓存数据

		return this.findOneFromDB(filter);

		// return this.findOneFromCache(filter) ||
		// 	this.findOneFromDB(filter);

		// return this.db.findOne(filter)
		// 	.then(res => this.saveOneToCache(res));
	}

	/**
	 * 查询单个数据，找不到会报错
	 */
	public getOne(filter: F<T> = {},
								throwFunc: Function = DefaultThrowFunc) {
		const res = this.findOne(filter)
		const process = (res): T => res || throwFunc({repo: this, filter});

		return res instanceof Promise ?
			res.then(process) : process(res);
	}

	/**
	 * 查询个数
	 */
	public count(filter: F<T> = {}) {
		if (!this.cacheEnable) // 如果不能用缓存，直接数据库查询
			return this.countFromDB(filter);

		const list = this.find(filter);
		const process = (list): number => list.length;

		return list instanceof Promise ?
			list.then(process) : process(list);
	}

	/**
	 * 查询是否存在
	 */
	public exist(filter: F<T> = {}) {
		const cnt = this.count(filter);
		const process = (cnt): boolean => cnt > 0;

		return cnt instanceof Promise ?
			cnt.then(process) : process(cnt);
	}

	/**
	 * 确保存在
	 */
	public ensure(filter: F<T> = {},
								throwFunc: Function = DefaultThrowFunc) {
		const res = this.findOne(filter);
		const process = res => !res && throwFunc({repo: this, filter});

		return res instanceof Promise ?
			res.then(process) : process(res);

		// if (res instanceof Promise)
		// 	// !res && throwFunc(): 如果res为空，执行throwFunc
		// 	return res.then(res => !res && throwFunc());
		// else
		// 	return !res && throwFunc();

		// if (!await this.findOne(filter)) throwFunc();
	}

	/**
	 * 确保不存在
	 */
	public ensureNot(filter: F<T> = {},
									 throwFunc: Function = DefaultThrowFunc) {
		const res = this.findOne(filter);
		const process = res => res && throwFunc({repo: this, filter});

		return res instanceof Promise ?
			res.then(process) : process(res);

		// const res = this.findOne(filter);
		// if (res instanceof Promise)
		// 	// res && throwFunc(): 如果res为空，执行throwFunc
		// 	return res.then(res => res && throwFunc());
		// else
		// 	return res && throwFunc();

		// if (await this.findOne(filter)) throwFunc();
	}

	/**
	 * 插入多个数据
	 */
	public insertMany(docs: T[]) {
		docs = this.saveToCache(docs)
		// 如果是使用缓存，则不需要存到数据库里（自动同步机制）
		if (this.cacheEnable) return;
		return this.insertManyToDB(docs);
	}

	/**
	 * 插入单个数据
	 */
	public insertOne(data: T) {
		data = this.saveOneToCache(data)
		// 如果是使用缓存，则不需要存到数据库里（自动同步机制）
		if (this.cacheEnable) return;
		return this.insertOneToDB(data);
	}

	/**
	 * 删除单个
	 */
	public deleteOne(filter: F<T> = {}) {
		// 如果缓存里有找到数据，则只需要删除缓存即可
		// 如果缓存里没找到数据，需要进一步从数据库里删除
		return this.deleteOneFromCache(filter) ||
			this.deleteOneFromDB(filter);
		// this.deleteOneFromCache(filter);
		// // 如果是使用缓存，则不需要存到数据库里（自动同步机制）
		// if (this.cacheEnable) return;
		// return this.deleteOneFromDB(filter);
	}

	/**
	 * 删除多个
	 */
	public deleteMany(filter: F<T> = {}) {
		this.deleteFromCache(filter);
		// 如果是使用缓存，则不需要存到数据库里（自动同步机制）
		if (this.cacheEnable) return;
		return this.deleteManyFromDB(filter);
	}

	/**
	 * 更新单个
	 */
	public updateOne(filter: T | F<T>, update: U<T>) {
		// 如果缓存里有找到数据，则只需要更新缓存即可
		// 如果缓存里没找到数据，需要进一步从数据库里更新
		return this.updateOneFromCache(filter, update) ||
			this.updateOneToDB(filter, update);
	}

	/**
	 * 更新多个
	 */
	public updateMany(filter: F<T>, update: U<T>) {
		this.updateFromCache(filter, update);
		// 如果是使用缓存，则不需要存到数据库里（自动同步机制）
		if (this.cacheEnable) return;
		return this.updateManyToDB(filter, update);
	}

	// endregion

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
		let process: Function = null;

		// 根据指定条件查询
		if (name.startsWith("findOne")) // 查找一个
			process = this.getFindOneFunc(name, keys);
		else if (name.startsWith("find")) // 查找多个
			process = this.getFindFunc(name, keys);
		else if (name.startsWith("get")) // 查找一个，查不到会报错
			process = this.getGetOneFunc(name, keys);

		else if (name.startsWith("count")) // 计数
			process = this.getCountFunc(name, keys);
		else if (name.startsWith("exist")) // 是否存在
			process = this.getExistFunc(name, keys);

		else if (name.startsWith("ensureNot")) // 确保不存在，不存在会报错
			process = this.getEnsureNotFunc(name, keys);
		else if (name.startsWith("ensure")) // 确保存在，不存在会报错
			process = this.getEnsureFunc(name, keys);

		else if (name.startsWith("deleteOne")) // 删除单个
			process = this.getDeleteOneFunc(name, keys);
		else if (name.startsWith("delete")) // 删除多个
			process = this.getDeleteManyFunc(name, keys);

		else if (name.startsWith("updateOne")) // 更新单个
			process = this.getUpdateOneFunc(name, keys);
		else if (name.startsWith("update")) // 更新多个
			process = this.getUpdateManyFunc(name, keys);

		const res = process && ((...p) => {
			const fromCache = this.isFromCache(name);
			try {
				if (fromCache) this._cacheOnly = true;
				return process.apply(this, p);
			} finally {
				if (fromCache) this._cacheOnly = false;
			}
		})

		return res;
	}

	private isFromCache(name) {
		const fc = this.constructor[FromCacheKey];
		return fc && !!fc[name];
	}
	private getKeysFromName(name) {
		const keys = this.constructor[FilterKey];
		const res = keys ? keys[name] : null;
		return res || this.analyseByClause(name);
	}
	private analyseByClause(name: string) {
		const strs = name.split("By");
		const res = strs[1]?.split("And") || [];
		return res.map(key => this.convertKey(key));
	}
	private makeFilter(keys: string[], ...p) {
		const res = {};
		keys.forEach((key, i) => res[key] = p[i]);
		return res as F<T>;
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

	private getDeleteOneFunc(name, keys) {
		return (...p) => this.deleteOne(this.makeFilter(keys, ...p));
	}
	private getDeleteManyFunc(name, keys) {
		return (...p) => this.deleteMany(this.makeFilter(keys, ...p));
	}

	private getUpdateOneFunc(name, keys) {
		return (...p) => {
			const fp = p.slice(0, p.length - 1), update = p[p.length - 1];
			return this.updateOne(this.makeFilter(keys, ...fp), update);
		}
	}
	private getUpdateManyFunc(name, keys) {
		return (...p) => {
			const fp = p.slice(0, p.length - 1), update = p[p.length - 1];
			return this.updateMany(this.makeFilter(keys, ...fp), update);
		}
	}

	private getThrowFunc(name): Function {
		const funcs = this.constructor[ThrowKey];
		const res = funcs ? funcs[name] : null;
		return res || DefaultThrowFunc;
	}
}
