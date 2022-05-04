import {BaseManager, getManager, manager} from "./BaseManager";
import {PromiseUtils} from "../../../utils/PromiseUtils";
import ShowModalSuccessCallbackResult = WechatMiniprogram.ShowModalSuccessCallbackResult;

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

export interface ErrorData {
	status?: number
	code: number
	errMsg?: string
	detail?: string
	data?: any

	alert?: AlertOptions,

	handled?: boolean
}

export class AppError extends Error implements ErrorData {

	public code: number;
	public errMsg: string
	public detail: string
	public data: any

	public alert: AlertOptions;

	constructor(code: number, errMsg: string,
							alert?: AlertParam, detail?: string, data?: any) {
		super()
		this.code = code;
		this.data = data;
		this.errMsg = errMsg;
		this.detail = detail;

		if (alert) {
			if (typeof alert == 'function') alert = alert();

			alert.title ||= errMsg;
			if (detail) alert.content = detail;
			this.alert = alert;
		}
	}
}

export type AlertParam = AlertOptions | ((...any) => AlertOptions);

/**
 * 将函数内捕捉到的异常都转化为throwFunc所抛出的异常类型（可配置detail）
 * 如果捕捉到的异常是自定义异常（GameError），不转化，直接抛出，否则拦截并转换
 * 如果捕捉到的异常是字符串，直接将其作为detail（不指定detail的情况下）
 * @param throwFunc
 * @param detail
 */
export function catchAsError(throwFunc: Function, detail?: string) {
	return (obj, key, desc) => {
		const oriFunc = desc.value;
		desc.value = function (...p) {
			return PromiseUtils.catcher(oriFunc.bind(this, ...p),
			e => {
				console.error("Catch", {e});
				if (e instanceof Error && e["code"]) throw e;

				detail ||= typeof e == "string" ? e : e?.detail;
				const data = e?.data || e;

				throwFunc(detail, data);
			});
		}
	}
}

/**
 * 处理异常注解（参数可选）
 * @param objOrUseThrow 处理后是否继续往外抛出异常，默认不抛出
 * @param key
 * @param desc
 */
export function handleError(
	objOrUseThrow: any | boolean, key?: string, desc?: any): any {

	let useThrow = false;
	const process = (obj, key, desc) => {
		const oriFunc = desc.value;
		desc.value = function(...p) {
			return PromiseUtils.catcher(oriFunc.bind(this, ...p),
			e => {
				alertMgr().handleError(e);
				if (useThrow) throw e;
			});
		}
	}
	if (typeof objOrUseThrow == "boolean") {
		useThrow = objOrUseThrow;
		return process;
	}
	process(objOrUseThrow, key, desc);
}

export function alertMgr() {
	return getManager(AlertManager);
}

@manager
class AlertManager extends BaseManager {

	public isToast = false;

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
			await this.doShowToast(config);
			await PromiseUtils.wait(config.duration);
		} else res = await this.doShowModal(config)
		return res;
	}
	public async hideAlert() {
		if (!this.isToast) return;
		await this.doHideToast();
	}

	public showToast(title: string, icon: IconType) {
		return this.showAlert({ title, icon, type: "toast" })
	}

	public handleError(error: ErrorData | string) {
		if (typeof error === "string")
			error = {code: 0, errMsg: error};

		if (!error || error.handled) return;
		error.handled = true;

		const config: AlertOptions = error.detail ?
			// 如果有detail，使用Modal，否则用Toast
			// 如果有error.alert，优先用alert的配置，否则直接配置
			new AppModal(error.alert || error.errMsg, error.detail) :
			new AppToast(error.alert || error.errMsg);

		console.error("Handled error: ", {error, config});

		this.showAlert(config).then();
	}

	/**
	 * 自定义实现
	 */
	protected doShowModal(config: AlertOptions) {
		return wx.showModal(config)
	}
	protected doShowToast(config: AlertOptions) {
		return wx.showToast(config)
	}
	protected doHideToast() {
		return wx.hideToast()
	}

}
