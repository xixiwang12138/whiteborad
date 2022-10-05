import {BaseManager, getManager, manager} from "./BaseManager";
import {PromiseUtils} from "../../../utils/PromiseUtils";
import {ErrorData, errorMgr} from "./ErrorManager";
import ShowModalSuccessCallbackResult = WechatMiniprogram.ShowModalSuccessCallbackResult;
import {loadingMgr} from "./LoadingManager";

export type AlertType = "toast" | "modal";
export type IconType = "success" | "error" | "loading" | "none";

export interface AlertOptions {

	enable?: boolean
	type?: AlertType

	title: string
	icon?: IconType
	image?: string
	duration?: number
	mask?: boolean

	content?: string
	showCancel?: boolean
	confirmText?: string
	cancelText?: string
	editable?: boolean
}

export class AppToast implements AlertOptions {

	type: AlertType = "toast";
	title: string;
	icon: IconType = "none";
	image: string;
	duration: number = 1500;
	mask: boolean = false;

	constructor(configOrTitle: AlertOptions | string,
							icon: IconType = "none") {
		const config = typeof configOrTitle == "object" ?
			configOrTitle : {
				title: configOrTitle, icon
			};

		Object.assign(this, config);
		this.type = "toast";
	}
}

export class AppModal implements AlertOptions {

	type: AlertType = "modal";
	title: string;
	content: string;
	showCancel: boolean = false;
	confirmText: string
	cancelText: string
	editable: boolean

	constructor(configOrTitle: AlertOptions | string,
							content?: string, showCancel = false,
							cancelText?: string) {
		const config = typeof configOrTitle == "object" ?
			configOrTitle : {
				title: configOrTitle, content,
				showCancel, cancelText
			};

		if (content) config.content = content;

		Object.assign(this, config);
		this.type = "modal";
	}
}

export type AlertParam = AlertOptions | ((...any) => AlertOptions);

export function alertMgr() {
	return getManager(AlertManager);
}

@manager
class AlertManager extends BaseManager {

	public isToast = false;

	constructor() {
		super();
		errorMgr().registerHandler(this.handleError.bind(this))
	}

	public async showAlert(titleOrConfig: string | AlertOptions,
												 showCancel: boolean = false)
		: Promise<null | ShowModalSuccessCallbackResult>  {
		let config: AlertOptions;
		if (typeof titleOrConfig == "string")
			config = { title: titleOrConfig, showCancel }
		else config = titleOrConfig;

		if (!config || config.enable === false) return;

		let res = null;
		this.isToast = config.type == "toast";

		if (this.isToast) {
			// @ts-ignore
			await this.onShowToast(config);
			await PromiseUtils.wait(config.duration);
		} else res = await this.onShowModal(config)
		return res;
	}
	public async hideAlert() {
		if (!this.isToast) return;
		await this.onHideToast();
	}

	public showToast(title: string, icon: IconType = "none") {
		return this.showAlert({ title, icon, type: "toast" })
	}

	public handleError(error: ErrorData) {
		const config: AlertOptions = error.detail ?
			// 如果有detail，使用Modal，否则用Toast
			// 如果有error.alert，优先用alert的配置，否则直接配置
			new AppModal(error.alert || error.errMsg, error.detail) :
			new AppToast(error.alert || error.errMsg);

		this.showAlert(config).then();
	}

	/**
	 * 自定义实现
	 */
	protected onShowModal(config: AlertOptions) {
		console.error("[L] showModal", config)
		return wx.showModal(config)
	}
	protected async onShowToast(config: AlertOptions) {
		//await PromiseUtils.waitFor(() => !loadingMgr().isLoading)
		console.error("[L] showToast", config)
		return wx.showToast(config)
	}
	protected onHideToast() {
		console.error("[L] hideToast")
		return wx.hideToast({})
	}

}
