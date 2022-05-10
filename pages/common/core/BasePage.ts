import {PageBuilder, pageFunc} from "../PageBuilder";
import {RootPage} from "./RootPage";
import {BaseData} from "../../../modules/core/data/BaseData";
import {field} from "../../../modules/core/data/DataLoader";
import {pageMgr} from "../../../modules/core/managers/PageManager";

// export enum PageState {
// 	Unloaded, Shown, Hidden
// }

export class BasePageData extends BaseData {

	@field
	title?: string = "";
	@field(Number)
	contentHeight?: number
}

/**
 * 页面基类
 */
export abstract class BasePage<
	D extends BasePageData = BasePageData, P = {}>
	extends RootPage<D> {

	public data: D = {} as D;
	public params: P = {} as P; // params是内部参数传递
	public extra: any; // extra是微信参数传递

	public app;

	// public status: PageState = PageState.Unloaded;

	// private isLoaded = false;

	constructor(params?: P) {
		super();
		this.app = getApp();
		this.params = params;
	}

	// region 页面数据

	private _setting;
	public get setting() {
		return this._setting ||= PageBuilder.getPageSetting(this.constructor);
	}
	public get path(): string { return this.setting.path; }
	public get title(): string { return this.setting.title; }

	/**
	 * 页面真实数据
	 */
	public pageData: BasePage<D>;
	get callPage(): RootPage { return this.pageData; }

	// /**
	//  * 生成页面配置的数据
	//  */
	// private _pageConfig;
	// public get pageConfig() {
	// 	return this._pageConfig ||= PageBuilder.build(this);
	// }

	// endregion

	// region 微信小程序内置回调

	/**
	 * OnLoad回调，子类无需添加pageFunc
	 */
	@pageFunc
	public async onLoad(e) {
		console.log("onLoad", e);
		this.extra = e;
		// @ts-ignore
		await this.setData({title: this.title});
		this.calcContentHeight();
	}

	/**
	 * OnReady回调
	 */
	@pageFunc
	public onReady() {
		// pageMgr().registerPage(this);
	}

	/**
	 * OnShow回调
	 */
	@pageFunc
	public onShow() {
		// this.status = PageState.Shown;
	}

	/**
	 * OnHide回调
	 */
	@pageFunc
	public onHide() {
		// this.status = PageState.Hidden;
	}

	/**
	 * OnUnload回调
	 */
	@pageFunc
	public onUnload() {
		// pageMgr().removePage(this);
	}

	// endregion

	// region 更新

	/**
	 * 更新
	 */
	public update() {
		// this.updateLoading();
	}

	/**
	 * 隐藏时更新
	 */
	public updateOnHidden() { }

	/**
	 * 更新Loading
	 */
	// private updateLoading() {
	// 	if (!this.isLoaded && dataMgr().loadingProgress() >= 1)
	// 		this.onDataLoad();
	// }

	// endregion

	// region 公用操作

	/**
	 * 计算内容高度
	 */
	public calcContentHeight() {
		const query = wx.createSelectorQuery();
		query.select(".top").boundingClientRect(
			async rect => {
			const wh = wx.getSystemInfoSync().windowHeight;
			const rh = rect?.height || 0;
			// @ts-ignore
			await this.setData({contentHeight: wh - rh});
		}).exec();
	}

	/**
	 * 页面回退
	 */
	@pageFunc
	public back() {
		pageMgr().pop().then();
	}

	// endregion
}

/**
 * 部分页基类
 */
export abstract class PartialPage<D extends BaseData = any>
	extends RootPage<D> {
	public data: D;
	public page: BasePage;

	get callPage(): RootPage { return this.page.callPage; }
}
