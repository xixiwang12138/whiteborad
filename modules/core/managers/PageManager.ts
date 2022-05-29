import {BaseManager, getManager, manager} from "./BaseManager";
import {BasePage} from "../../../pages/common/core/BasePage";
import {Constructor} from "../BaseContext";

export function pageMgr() {
	return getManager(PageManager);
}

@manager
class PageManager extends BaseManager {

	private pages: BasePage[] = [];

	// region 内部页面控制

	// /**
	//  * 注册页面
	//  */
	// public registerPage(page: BasePage) {
	// 	this.pages.push(page);
	// }
	//
	// /**
	//  * 移除页面
	//  */
	// public removePage(page: BasePage) {
	// 	this.pages.splice(
	// 		this.pages.indexOf(page), 1);
	// }

	/**
	 * 设置初始页面
	 */
	public setFirstPage(type) {
		const res = new type();
		this.pages.push(res);
		return res;
	}

	/**
	 * 更新每个页面
	 */
	public update() {
		super.update();
		this.pages.forEach(p =>
			p == this.curPage() ? p.update() : p.updateOnHidden()
		)
	}

	/**
	 * 当前页面
	 */
	public curPage() {
		return this.pages[this.pages.length - 1];
	}

	// endregion

	// region 页面导航控制

	/**
	 * 获取当前页面的名字
	 */
	public get curPageName() {
		const pages = getCurrentPages();
		const page = pages[pages.length - 1];
		return this.getPageName(page.__route__);
	}

	/**
	 * 进入页面（相当于页面栈的PUSH操作）
	 * TODO: 如何实现反向的类型检测？
	 */
	public push<T extends BasePage<any, P>, P>(
		type: Constructor<T>, data?: P, force: boolean = false) {
		if (!force && this.isCurPage(type)) return;

		const page = new type(data);
		this.pages.push(page);

		return this.doNav("navigateTo", page.path);
	}

	/**
	 * 改变当前页面（相当于先POP再PUSH）
	 */
	public change<T extends BasePage<any, P>, P>(
		type: Constructor<T>, data?: P, force: boolean = false) {
		if (!force && this.isCurPage(type)) return;

		const page = new type(data);
		this.pages.pop();
		this.pages.push(page);

		return this.doNav("redirectTo", page.path);
	}

	/**
	 * 清空页面栈并跳转到指定页面
	 */
	public goto<T extends BasePage<any, P>, P>(
		type: Constructor<T>, data?: P, force: boolean = false) {
		if (!force && this.isCurPage(type)) return;

		const page = new type(data);
		this.pages = [page];

		return this.doNav("reLaunch", page.path);
	}

	/**
	 * 返回页面（POP操作）
	 * @param delta 层数
	 */
	public pop(delta: number = 1) {
		for (let i = 0; i < delta; i++)
			this.pages.pop();

		console.log("[Navigate] navigateBack", delta);
		return wx.navigateBack({delta});
	}

	/**
	 * 切换页面（同switchTab）
	 */
	public switch<P = {}, T extends BasePage<any, P> = BasePage<any, P>>(
		type: Constructor<T>, data?: P, force: boolean = false) {
		if (!force && this.isCurPage(type)) return;

		const page = new type(data);
		this.pages.pop();
		this.pages.push(page);

		return this.doNav("switchTab", page.path);
	}

	private doNav(method: "navigateTo" | "redirectTo" |
		"reLaunch" | "switchTab", path: string) {
		// if (!force && this.isCurPage(path)) return;

		// const url = StringUtils.makeURLString(page, data);
		console.log("[Navigate]", method, path);

		// @ts-ignore
		return wx[method]({url: path});
	}

	/**
	 * 获取一个页面的名称
	 */
	public getPageName(page) {
		if (!page) return "";
		const strs = page.split('/');
		return strs[strs.length - 1];
	}

	/**
	 * 判断两个page是否相同页面
	 */
	public isSamePage(page1, page2) {
		return this.getPageName(page1) == this.getPageName(page2);
	}

	/**
	 * 判断指定页面是否当前页面
	 */
	public isCurPage(type: Constructor) {
		return type == this.curPage.constructor;
		// return typeOrPath instanceof Function ?
		// 	this.curPage.constructor == typeOrPath :
		// 	this.getPageName(typeOrPath) == this.curPageName;
	}

	// endregion

}
