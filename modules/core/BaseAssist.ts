
import {Interface, InterfaceOptions, Method, networkMgr} from "./managers/NetworkManager";
import {AppLoading} from "./managers/LoadingManager";
import {AlertOptions, AppModal, AppToast, IconType} from "./managers/AlertManager";

export type Itf<I = any, O = any> = (data?: I) => Promise<O>

export function loading(code: number, title?: string,
                        mask: boolean = false) {
  return new AppLoading(code, title, mask);
}
export function toast(configOrTitle: AlertOptions | string,
                      icon: IconType = "none") {
  return new AppToast(configOrTitle, icon);
}
export function modal(configOrTitle: AlertOptions | string,
                      content?: string, showCancel = false,
                      cancelText?: string) {
  return new AppModal(configOrTitle, content, showCancel, cancelText);
}

export function post(hostOrRoute: string,
                     routeOrUseToken?: string | boolean): any {
  const opt = makeInterfaceOption("POST",
    hostOrRoute, routeOrUseToken);
  return p => networkMgr().request(new Interface(opt), p);
}
export function get(hostOrRoute: string,
                    routeOrUseToken?: string | boolean): any {
  const opt = makeInterfaceOption("GET",
    hostOrRoute, routeOrUseToken);
  return d => networkMgr().request(new Interface(opt), d)
}

function makeInterfaceOption(method: Method,
                             hostOrRoute: string,
                             routeOrUseToken?: string | boolean): InterfaceOptions {
  const res: InterfaceOptions = { method, route: hostOrRoute };
  if (typeof routeOrUseToken === "string") { // 有host参数
    res.host = hostOrRoute;
    res.route = routeOrUseToken;
    // 有host参数，不可设置token
    res.useToken = false;
  } else
    res.useToken = routeOrUseToken;

  if (res.useToken === undefined) res.useToken = true;
  return res;
}
