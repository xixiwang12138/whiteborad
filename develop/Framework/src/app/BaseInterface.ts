import {BaseManager, getManager, manager} from "./ManagerContext";
import {Constructor, getSingleton} from "../utils/SingletonUtils";
import {app} from "./App";
import {Express, Router} from "express";
import bodyparser from "body-parser";
import {Config} from "../configs/Config";
import {ParamCodec} from "../utils/ParamCodec";
import {getMetaData, isChildClassOf} from "../utils/TypeUtils";
import {BaseData, DataOccasion} from "../modules/coreModule/data/BaseData";
import {DataLoader} from "../modules/coreModule/utils/DataLoader";
import {handleError, resData, resError} from "../modules/coreModule/managers/ResponseManager";


export class ParamDef {
	name: string;
	type: Constructor;
	index: number;
	optional: boolean = false;
	default_: any = null;
}

export class RequestData {
	method: 'post' | 'get';
	path: string;
	obj: any;
	key: string;
	desc: { value: Function }
}

export function route<T extends BaseInterface>(route = "/") {
	return (clazz: Constructor<T>) => {
		const setting = InterfaceBuilder.getSetting(clazz);
		setting.instance = new clazz();
		setting.path = route;

		interfaceMgr().registerInterface(clazz);
	}
}

export function post(path: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createInterface(
			clazz, key, "post", path);
	}
}
export function get(path: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createInterface(
			clazz, key, "get", path);
	}
}
export function put(path: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createInterface(
			clazz, key, "put", path);
	}
}
export function del(path: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createInterface(
			clazz, key, "delete", path);
	}
}

export function body(name: string,
					 optional: boolean = false, default_?) {
	return (obj, key, index) => {
		const clazz = obj.constructor;
		const type = Reflect.getMetadata("design:paramtypes", obj, key)[index];
		InterfaceBuilder.createParam(clazz, key, "body",
			index, name, type, optional, default_);
	}
}
export function query(name: string,
					  optional: boolean = false, default_?) {
	return (obj, key, index) => {
		const clazz = obj.constructor;
		const type = Reflect.getMetadata("design:paramtypes", obj, key)[index];
		InterfaceBuilder.createParam(clazz, key, "query",
			index, name, type, optional, default_);
	}
}

export function params(name: string,
					   optional: boolean = false, default_?) {
	return (obj, key, index) => {
		const clazz = obj.constructor;
		const type = Reflect.getMetadata("design:paramtypes", obj, key)[index];
		InterfaceBuilder.createParam(clazz, key, "params",
			index, name, type, optional, default_);
	}
}


export function middleWare(obj, key, desc) {
	interfaceMgr().addMiddleWare(desc.value);
}

export function routeMiddleWare(obj, key, desc) {
	interfaceMgr().addRouteMiddleWare(desc.value);
}


export function interfaceMgr() {
	return getManager(InterfaceManager)
}
export type RouteMiddleWare = (itf: InterfaceSetting) =>
	(req: any, res: any, next: Function) => any;

@manager
class InterfaceManager extends BaseManager {

	public baseMiddleWares = [];
	public routeMiddleWares: RouteMiddleWare[] = [];
	public requests: RequestData[] = [];
	public middleWares = [];
	public interfaceTypes: Constructor<BaseInterface>[] = [];

	constructor() {
		super();
		this.setupAppProcessors();
	}

	/**
	 * 通过指定url获取接口设置
	 * @param url
	 */
	private urlCache: {[T: string]: InterfaceSetting} = {};
	public getSettingByUrl(url: string) {
		if (!this.urlCache[url]) {
			const rawUrl = url;
			url = url.split("?")[0]; // 把get请求的参数去掉得到路由部分

			const settings = this.interfaceTypes
				.map(it => InterfaceBuilder.getSetting(it));
			const setting = settings.find(s => url.startsWith(s.path));
			if (!setting) return null;

			url = url.replace(/\//g, "\\");

			for (let key in setting.interfaces) {
				const iSetting = setting.interfaces[key];
				const fullPath = path.join(setting.path, iSetting.path)
				if (url == fullPath)
					return this.urlCache[rawUrl] = iSetting;
			}
			return null;
		}
		return this.urlCache[url];
	}

	// region APP接口处理

	private setupAppProcessors() {
		app().registerAppProcessor(this.setupBase.bind(this));
		app().registerAppProcessor(this.setupMiddleWares.bind(this));
		app().registerAppProcessor(this.setupInterfaces.bind(this));
	}
	private setupBase(app: Express) {
		// app.get("", () => {}, ())

		// 设置跨域
		app.all('*', function(req, res, next) {
			console.log("Receive: ", req);

			res.header("Access-Control-Allow-Origin", req.headers.origin); // 设置允许来自哪里的跨域请求访问（req.headers.origin为当前访问来源的域名与端口）
			res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"); // 设置允许接收的请求类型
			res.header("Access-Control-Allow-Headers",
				"Content-Type, x-requested-with, X-Custom-Header, Request-Ajax, Authorization"); // 设置请求头中允许携带的参数
			res.header("Access-Control-Allow-Credentials", "true"); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能为 '*'
			res.header("Access-Control-Max-Age", "1000"); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数

			next();
		});

		app.use(bodyparser.json({limit: '10mb'}))
		app.use(bodyparser.urlencoded({limit: '10mb', extended: true}))
	}

	// region 中间件

	public addMiddleWare(func: Function) {
		this.baseMiddleWares.push(func);
	}
	public addRouteMiddleWare(func: RouteMiddleWare) {
		this.routeMiddleWares.push(func);
	}

	private setupMiddleWares(app: Express) {
		this.baseMiddleWares.forEach(func => app.use(func));
	}

	// endregion

	// endregion

	// region 接口

	/**
	 * 注册接口类
	 * @param type
	 */
	public registerInterface<T extends BaseInterface>(
		type: Constructor<T>) {
		this.interfaceTypes.push(type);
	}

	/**
	 * 初始化接口
	 */
	protected setupInterfaces(app: Express) {
		this.interfaceTypes.forEach(it => this.setupInterfaceType(app, it));
	}

	private setupInterfaceType<T extends BaseInterface>(
		app: Express, type: Constructor<T>) {
		const setting = InterfaceBuilder.getSetting(type);
		const interface_ = setting.instance;
		const router = Router();

		for (const key in setting.interfaces)
			this.setupInterface(interface_, router,
				setting.interfaces[key]);

		app.use(setting.path, router);
	}

	private setupInterface<T extends BaseInterface>(
		interface_: T, router: Router, itf: InterfaceSetting) {
		const func = interface_[itf.key];

		const middles = this.routeMiddleWares.map(m => m(itf));

		router[itf.method](itf.path, ...middles, async (req, res) => {
			try {
				const params = [];
				// TODO: 加密功能
				itf.params.forEach(p => this.processParam(
					params, p, req[p.method][p.name], p.name));

				const payload = req.body['payload'];
				const iRes = await func.call(interface_, ...params, payload)

				let returnData: any = resData(iRes);
				// TODO: 加密功能
				// if (AppConfig.enableEncrypt)
				// 	returnData = ParamCodec.encode(JSON.stringify(returnData));

				res.status(200).json(returnData);
				console.log("Success: ", iRes);
			} catch (e) {
				handleError(res, e);
			}
		})
	}
	private processParam(outParams, param: ParamSetting, reqData, key) {
		if (reqData !== undefined) // 如果有参数
			outParams[param.index] = this.convertType(reqData, param.type);
		else if (param.optional)
			outParams[param.index] = param.default_;
		else throw "Missing Param：" + key;
	}


	public addRequest(request: RequestData) {
		request.obj.constructor.interfaces ||= {};
		this.requests.push(request);
	}

	public setupParam(type, obj, key, pd: ParamDef) {
		const clazz = obj.constructor;
		clazz.interfaces ||= {};

		const itf = clazz.interfaces[key] ||= {};
		itf[type] ||= {};
		itf[type][pd.name] = pd;
	}

	// region 请求处理

	processParams(outParams, params, rawReq) {
		if (!params) return;

		// 处理解密（如果前端加密了）
		let req = {};
		const eParams = rawReq[Config.encrypt.encryptParamKey];
		if (eParams) {
			let decr = ParamCodec.decode(eParams);
			// 如果等于null说明传过来的参数有问题，可能是伪造的
			if (decr != null) {
				decr.split("&").forEach(reqStr => {
					let eqIdx = reqStr.indexOf("=");
					let key = reqStr.substr(0, eqIdx);
					req[key] = decodeURIComponent(reqStr.substr(eqIdx + 1));
				})
			}
		} else if (Config.encrypt.enableNoEncrypt)
			req = rawReq;
		else throw "不允许未加密的请求数据！";

		for (const key in params) {
			const param = params[key];

			if (key in req)
				outParams[param.index] = this.convertType(req[key], param.type);
			else if (param.optional)
				outParams[param.index] = param.default_;
			else throw "缺少参数：" + key;
		}
	}

	private convertType(val, type) {
		let res = val;

		try {
			switch (type) {
				case Number: res = Number(val); break;
				case String: break;
				case Boolean: res = eval(val); break;
				case Array: res = eval(val); break;
				case Object: res = eval("(" + val + ")"); break;
				default:
					if (isChildClassOf(type, BaseData))
						res = DataLoader.load(DataOccasion.Interface, type, eval("(" + val + ")"));
					else
						res = eval(val);
			}
		} catch (e) {
			throw "Type Error：" + e;
		}
		if (res?.constructor != type) throw "Type Error";
		return res;
	}

	processRequest(app: Express, request: RequestData) {
		const func = request.desc.value;
		const clazz = request.obj.constructor;
		const itf = clazz.interfaces[request.key];
		const that = getSingleton(clazz);

		app[request.method](request.path, async (req, res) => {
			try {
				const params = [];

				if (itf) {
					this.processParams(params, itf["bodies"], req.body);
					this.processParams(params, itf["queries"], req.query);
				}
				const payload = req.body['payload'];
				const iRes = await func.call(that, ...params, payload)

				let returnData: any = resData(iRes);
				// 处理加密结果
				// if (Config.encrypt.enableEncrypt)
				// 	returnData = ParamCodec.encode(
				// 		JSON.stringify(returnData));

				res.status(200).json(returnData);
				console.log("Success: ", iRes);
			} catch (e) {
				handleError(res, e);
			}
		})
	}

	// endregion

	// endregion

	// endregion

	// region 本地请求


	// endregion

}

export type ParamSetting = {
	method: 'body' | 'query' | 'params'
	name: string
	type: Constructor
	index: number
	optional: boolean
	default_: any
}

export type InterfaceSetting = {
	method: 'post' | 'get' | 'put' | 'delete'
	path: string
	key: string
	params: ParamSetting[]
	extra?: any
}

type RouteSetting<M extends BaseInterface> = {
	instance: M
	path: string
	interfaces: {[T: string]: InterfaceSetting}
}
const InterfaceSettingKey = "interfaceSetting";

export class InterfaceBuilder {

	public static getSetting<T extends BaseInterface>(type: Constructor<T>) {
		return getMetaData<RouteSetting<T>>(
			type, InterfaceSettingKey, {
				instance: null, path: "/", interfaces: {}
			});
	}

	public static createInterface<T extends BaseInterface>(
		clazz: Constructor<T>, key, method?, route?) {
		const setting = this.getSetting(clazz);
		const res: InterfaceSetting =
			setting.interfaces[key] ||= {} as InterfaceSetting;
		res.method ||= method; res.path ||= route;
		res.key ||= key; res.params ||= []
		res.extra ||= {}
		return res;
	}
	public static createParam<T extends BaseInterface>(
		clazz: Constructor<T>, key, method, index, name, type,
		optional = false, default_ = undefined) {
		const setting = this.createInterface(clazz, key);
		const res = setting.params[index] ||= {} as ParamSetting;
		res.method = method; res.index = index;
		res.name = name; res.type = type;
		res.default_ = default_; res.optional = optional;
		return res;
	}

}

import {authMgr} from "../modules/coreModule/managers/AuthManager";
import * as path from "path";

export class BaseInterface {

}

