import {getMetaData} from "../../utils/TypeUtils";
import {RootPage} from "./core/RootPage";

type PageSetting = {
	pageFuncs: string[],
	path?: string, title?: string
}
const PageSettingKey = "setting";

export function makePage<T extends BasePage>(clazz: Constructor<T>) {
	const setting = PageBuilder.getPageSetting(clazz);

	const config = PageBuilder.build(clazz);
	const testPage = Object.assign({}, config);
	PageBuilder.runtimeBuild(testPage, clazz, true);
	console.log("Page", clazz.name, setting.title, testPage);

	Page(config)
}

export function page<T extends BasePage>(
	name: string, title?: string) {
	return (clazz: Constructor<T>) => {
		const setting = PageBuilder.getPageSetting(clazz);
		setting.path = `/pages/${name}/${name}`;
		setting.title = title;
		// const config = PageBuilder.build(clazz);
		// console.log("Page", clazz.name, title, config);
		// Page(config)
	}
}

export function pageFunc(obj, key, desc) {
	const setting = PageBuilder.getPageSetting(obj.constructor);
	setting.pageFuncs.push(key);
}

export class PageBuilder {

	/**
	 * 获取页面设置
	 */
	public static getPageSetting(type) {
		return getMetaData<PageSetting>(type,
			PageSettingKey, { pageFuncs: [] })
	}

	/**
	 * 构建
	 */
	public static build<T extends BasePage>(type: Constructor<T>) {
		//, page: BasePage) {
		// const page = new type();
		// const res = {
		// 	data: {}, pageObject: null,
		// 	onLoad: function () {
		// 		PageBuilder.buildInRes(this, type);
		// 		// // @ts-ignore
		// 		// this.pageObject = pageMgr().curPage() ||
		// 		// 	pageMgr().setFirstPage(type);
		// 		// this.pageObject.pageData = this;
		// 	}
		// 	// onUnload: function () {
		// 	// 	page.pageData = null;
		// 	// }
		// };
		//
		// // 处理Page上的所有函数
		// this.processPageFuncs(res, page);
		// this.processPageData(res, page);
		//
		// // 筛选出PartPage并进行combine
		// Object.keys(page)
		// 	.filter(key => page[key] instanceof PartialPage)
		// 	.forEach(key => this.combinePartPage(res, page, page[key]));

		return {
			data: {}, pageObject: null,
			onLoad: function (e) {
				PageBuilder.runtimeBuild(this, type);
				this.onLoad(e);
			}
		};
	}

	public static runtimeBuild<T extends BasePage>(
		res, type: Constructor<T>, test = false) {
		const page = test ? new type() :
			(pageMgr().newestPage || new type());

		res.pageObject = page;
		page.pageData = res;

		res.onLoad = undefined; // function (e) { }

		// 处理Page上的所有函数
		this.processPageFuncs(res, page);
		this.processPageData(res, page);

		// 筛选出PartPage并进行combine
		Object.keys(page)
			.filter(key => page[key] instanceof PartialPage)
			.forEach(key => this.combinePartPage(res, page, page[key]));
	}

	private static combinePartPage(
		res, page: BasePage, partPage: PartialPage) {
		partPage.page = page;

		this.processPageFuncs(res, partPage);
		this.processPageData(res, partPage);
	}

	private static processPageFuncs(res, page) {
		const setting = this.getPageSetting(page.constructor);
		if (!setting) return;

		for (const key of setting.pageFuncs)
			this.processPageFunc(res, page, key)
	}

	private static processPageFunc(res, page: RootPage, key) {
		const rFunc = res[key];
		if (!rFunc) // 如果res里面没有key
			res[key] = page[key].bind(page);
		else { // 否则，需要合并
			const callers = res[key + '_callers'] ||= [rFunc];
			const rFunc2 = page[key].bind(page)
			callers.push(rFunc2);

			res[key] = async function(...p) {
				let res;
				for (const caller of callers)
					caller && (res = await caller.apply(this, p))
				return res;
			}
		}
	}

	private static processPageData(res, page: RootPage) {
		const data = DataLoader.convert(DataOccasion.Extra, page.data);
		Object.assign(res.data, data);
	}

	// public makePage<T extends BasePage, P extends PartialPage>(
	// 	page: T | Constructor<T>, partPages: (P | Constructor<P>)[]): T {
	//
	// 	// Step1: 将所有参数转化为页面实例/部分页面实例
	// 	if (typeof page == "function") page = new page();
	// 	partPages = partPages.map(
	// 		pp => typeof pp == "function" ? new pp() : pp);
	//
	// 	// Step2: 构造返回结果res的基本框架
	// 	const res = {};
	// 	Object.assign(res, page);
	//
	// 	// Step3: 逐步递归获取父类，将父类的变量&函数加入到res中（RootPage除外）
	// 	let proto = page["__proto__"];
	// 	while (proto.constructor != RootPage) {
	// 		Object.getOwnPropertyNames(proto)
	// 			.forEach(key => res[key] ||= proto[key]);
	// 		proto = proto["__proto__"];
	// 	}
	//
	// 	// Step4: 将其他部分页面的变量&函数也加入到res中
	// 	partPages.forEach(pp => {
	// 		Object.getOwnPropertyNames(pp)
	// 			.forEach(key => this.processKey(res, pp, key));
	//
	// 		const ppRes = {};
	// 		let proto = pp["__proto__"];
	// 		while (proto.constructor != RootPage) {
	// 			Object.getOwnPropertyNames(proto)
	// 				.forEach(key => ppRes[key] ||= proto[key]);
	// 			proto = proto["__proto__"];
	// 		}
	//
	// 		Object.getOwnPropertyNames(ppRes)
	// 			.forEach(key => this.processKey(res, pp, key));
	// 		// Object.getOwnPropertyNames(pp.constructor.prototype)
	// 		// 	.forEach(key => processKey(res, pp, key));
	// 	});
	//
	// 	return res as T;
	// }
	// private processKey(page, partPage, key) {
	// 	const pVal = page[key], ppVal = partPage[key];
	// 	if (pVal === undefined) // 如果page没有key
	// 		page[key] = ppVal;
	// 	else if (typeof pVal != typeof ppVal)
	// 		throw "页面的值类型不一致！";
	// 	else if (typeof pVal == "object")
	// 		page[key] = Object.assign(page[key] || {}, ppVal);
	// 	else if (typeof pVal == "function") {
	// 		const callers = page[key + '_callers'] ||= [pVal];
	// 		callers.push(ppVal);
	//
	// 		page[key] = async function (...p) {
	// 			let res;
	// 			for (const caller of callers)
	// 				if (caller) res = await caller.apply(this, p);
	// 			return res;
	// 		}
	// 	} else page[key] = ppVal;
	// }

}
import {BasePage, PartialPage} from "./core/BasePage";
import {Constructor} from "../../modules/core/BaseContext";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {DataLoader, DataOccasion} from "../../modules/core/data/DataLoader";
