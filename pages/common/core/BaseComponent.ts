// import {pageMgr} from "../../../modules/coreModule/managers/PageManager";
// import {dataMgr} from "../../../modules/coreModule/managers/DataManager";
// import {BaseData} from "../../../modules/coreModule/data/BaseData";
// import {DataLoader, DataOccasion, field} from "../../../modules/coreModule/data/DataLoader";
// import {PageBuilder, pageFunc} from "../PageBuilder";
// import {RootPage} from "./RootPage";
// import {RootComponent} from "./RootComponent";
//
// export enum PageState {
// 	Unloaded, Shown, Hidden
// }
//
// export class BasePageData extends BaseData {
//
// 	@field
// 	title?: string = "";
// 	@field(Number)
// 	contentHeight?: number
// }
//
// /**
//  * 页面基类
//  */
// export abstract class BaseComponent<D extends BasePageData = BasePageData>
// 	extends RootComponent<D> {
// // export abstract class BasePage extends RootPage {
// 	public data: D = {} as D;
// 	public params: any;
//
// 	public status: PageState = PageState.Unloaded;
//
// 	private isLoaded = false;
//
// 	// region 页面生成
//
// 	/**
// 	 * 页面真实数据
// 	 */
// 	public pageData: BasePage<D>;
// 	get callPage(): RootPage { return this.pageData; }
//
// 	/**
// 	 * 生成页面配置的数据
// 	 */
// 	private _pageConfig;
// 	public get pageConfig() {
// 		return this._pageConfig ||= PageBuilder.build(this);
// 	}
//
// 	// endregion
//
// 	// region 微信小程序内置回调
//
// 	/**
// 	 * OnLoad回调
// 	 */
// 	@pageFunc
// 	public onLoad(e) {
// 		console.log("onLoad", e);
// 		this.params = e;
// 		this.calcContentHeight();
// 	}
//
// 	/**
// 	 * OnReady回调
// 	 */
// 	@pageFunc
// 	public onReady() {
// 		pageMgr().registerPage(this);
// 	}
//
// 	/**
// 	 * OnShow回调
// 	 */
// 	@pageFunc
// 	public onShow() {
// 		this.status = PageState.Shown;
// 	}
//
// 	/**
// 	 * OnHide回调
// 	 */
// 	@pageFunc
// 	public onHide() {
// 		this.status = PageState.Hidden;
// 	}
//
// 	/**
// 	 * OnUnload回调
// 	 */
// 	@pageFunc
// 	public onUnload() {
// 		pageMgr().removePage(this);
// 	}
//
// 	// endregion
//
// 	// region 数据处理
//
// 	/**
// 	 * 设置数据
// 	 */
// 	public async setData(data: Partial<D> & WechatMiniprogram.IAnyObject, callback?: () => void) {
// 		// 更新Page内数据
// 		for (const key in data) {
// 			const val = this.data[key] = data[key];
// 			// TODO: 对简单的数组和对象进行处理，需要拓展
// 			if (val instanceof Array) for (const v of val)
// 				if (v?.refresh instanceof Function) await v.refresh();
// 			if (val?.refresh instanceof Function) await val.refresh();
// 		}
// 		// 更新微信Page数据
// 		const data_: any = DataLoader.convert(DataOccasion.Extra, data);
// 		return this.callPage?.setData(data_, callback);
// 	}
//
// 	// endregion
//
// 	// region 自定义回调
//
// 	/**
// 	 * 数据读取回调
// 	 */
// 	protected onDataLoad() {
// 		this.isLoaded = true;
// 	}
//
// 	// endregion
//
// 	// region 更新
//
// 	/**
// 	 * 更新
// 	 */
// 	public update() {
// 		this.updateLoading();
// 	}
//
// 	/**
// 	 * 隐藏时更新
// 	 */
// 	public updateOnHidden() { }
//
// 	/**
// 	 * 更新Loading
// 	 */
// 	private updateLoading() {
// 		if (!this.isLoaded && dataMgr().loadingProgress() >= 1)
// 			this.onDataLoad();
// 	}
//
// 	// endregion
//
// 	// region 公用操作
//
// 	/**
// 	 * 计算内容高度
// 	 */
// 	public calcContentHeight() {
// 		const query = wx.createSelectorQuery();
// 		query.select(".top").boundingClientRect(rect => {
// 			const wh = wx.getSystemInfoSync().windowHeight;
// 			const rh = rect?.height || 0;
// 			// @ts-ignore
// 			this.setData({contentHeight: wh - rh});
// 		}).exec();
// 	}
//
// 	/**
// 	 * 页面回退
// 	 */
// 	@pageFunc
// 	public back() {
// 		pageMgr().pop().then();
// 	}
//
// 	// endregion
// }
//
// /**
//  * 部分页基类
//  */
// export abstract class PartialPage<D extends BaseData = any>
// 	extends RootPage<D> {
// 	public data: D;
// 	public page: BasePage;
//
// 	get callPage(): RootPage { return this.page; }
// }
