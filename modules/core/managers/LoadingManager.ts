import {BaseManager, getManager, manager} from "./BaseManager";

export interface LoadingOptions {
	title: string
	mask?: boolean
	enable?: boolean
}

export class AppLoading implements LoadingOptions {

	public code: number;
	public title: string;
	public mask: boolean;

	constructor(code: number, title?: string,
							mask: boolean = false) {
		this.code = code;
		this.title = title;
		this.mask = mask;
	}
}

export type LoadingParam = LoadingOptions | ((...any) => LoadingOptions);

export function showLoading(settingOrObj?: LoadingParam | object,
														detailOrKey?: string, desc?: any): any {

	// 不能加默认值，默认值在startLoading内加
	let setting: LoadingOptions = undefined; // = CoreLoading.Default();

	const process = (obj, key, desc) => {
		const oriFunc = desc.value;
		const mgr = loadingMgr();

		desc.value = async function(...p) {
			await mgr.showLoading(setting);
			return await oriFunc.apply(this, p)
				.finally(() => mgr.hideLoading());
		}
	}

	// 只有一个参数
	if (!detailOrKey && !desc) {
		setting = typeof settingOrObj == 'function' ?
			settingOrObj(detailOrKey) : settingOrObj;

		return process;
	}
	process(settingOrObj, detailOrKey, desc);
}

export function blockLoading(obj, key, desc) {
	const oriFunc = desc.value;
	const mgr = loadingMgr();

	desc.value = async function(...p) {
		mgr.isBlocked = true;
		return await oriFunc.apply(this, p)
			.finally(() => mgr.isBlocked = false);
	}
}

export function loadingMgr(): LoadingManager {
	return getManager(LoadingManager);
}

@manager
class LoadingManager extends BaseManager {

	public isLoading = false;
	public isBlocked = false;

	public async showLoading(config: LoadingOptions = {title: "加载中"}) {
		console.error("[S] showLoading", this.isBlocked, config)
		if (this.isBlocked || !config ||
			config?.enable === false) return false;

		await this.onShowLoading(config);
		this.isLoading = true;
		return true;
	}
	public async hideLoading() {
		// console.error("hideLoading", this.isBlocked);
		if (this.isBlocked || !this.isLoading) return;

		await this.onHideLoading();
		this.isLoading = false;
	}

	/**
	 * 自定义Loading实现
	 */
	protected onShowLoading(config: LoadingOptions) {
		console.error("[L] showLoading", config)
		return wx.showLoading(config);
	}
	protected onHideLoading() {
		console.error("[L] hideLoading")
		return wx.hideLoading();
	}
}
