import {Interface, InterfaceOptions, Method, networkMgr, Option} from "../modules/coreModule/managers/NetworkManager";

export type Itf<I = any, O = any> = (data?: I, options?: Option) => Promise<O>

export function error(status: number, code: number, errMsg?: string, detail?: string) {
	return (_detail?, data?) => {
		throw new AppError(status, code, errMsg, detail, data);
	}
}

export function post(hostOrRoute: string, route?: string): any {
	const opt = makeInterfaceOption("post", hostOrRoute, route);
	return (d?, o?) => networkMgr().request(new Interface(opt), d, o);
}
export function get(hostOrRoute: string, route?: string): any {
	const opt = makeInterfaceOption("get", hostOrRoute, route);
	return (d?, o?) => networkMgr().request(new Interface(opt), d, o)
}

function makeInterfaceOption(method: Method,
														 hostOrRoute: string,
														 route?: string): InterfaceOptions {
	const res: InterfaceOptions = { method, route: hostOrRoute };
	if (typeof route === "string") { // 有host参数
		res.host = hostOrRoute;
		res.route = route;
	}
	return res;
}

import {AppError} from "../modules/coreModule/managers/ErrorManager";
