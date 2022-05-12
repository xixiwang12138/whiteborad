import {PromiseUtils} from "../../../utils/PromiseUtils";
import {alertMgr, AlertOptions, AlertParam} from "./AlertManager";
import {BaseManager, getManager, manager} from "./BaseManager";

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
		desc.value = function (...p) {
			return PromiseUtils.catcher(
				oriFunc.bind(this, ...p),
				e => {
					errorMgr().handleError(e);
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

export type ErrorHandler = (e: ErrorData) => boolean

export function errorMgr() {
	return getManager(ErrorManager);
}

@manager
class ErrorManager extends BaseManager {

	private handlers: ErrorHandler[] = [];

	public registerHandler(handler: ErrorHandler) {
		this.handlers.push(handler);
	}
	public removeHandler(handler: ErrorHandler) {
		const index = this.handlers.indexOf(handler);
		this.handlers.splice(index, 1);
	}

	public handleError(e: ErrorData | string) {
		const error = typeof e === "string" ?
			{code: 0, errMsg: e, handled: false} : e;
		this.handlers.forEach(handler => {
			if (!error || error.handled) return;
			error.handled = true;

			console.error("Handled error: ", error);

			handler(error);
		})
	}
}
