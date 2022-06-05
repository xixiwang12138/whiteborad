
// const Host = "https://www.exermon.com:8086";
import { BaseManager, getManager, manager } from "./BaseManager";
import { DataLoader } from "../data/DataLoader";
import { StringUtils } from "../../../utils/StringUtils";
import { alertMgr } from "./AlertManager";
import { loadingMgr, LoadingOptions, LoadingParam } from "./LoadingManager";
import { loading } from "../BaseAssist";

// const Host = "https://homi-http-server-1836805-1255510304.ap-shanghai.run.tcloudbase.com";
const Host = "http://localhost:8090";

const Request = loading(100001, "请求中", true);
const DefaultTimeOut = 120000;

export type Method = 'GET' | 'POST';

export type InterfaceLoading = LoadingParam | boolean | null;
// 为false则不显示Loading，不填则使用默认值

export type InterfaceParam = Interface |
  ((...any) => Interface);

export interface InterfaceOptions {
  method: Method;
  host?: string;
  route: string;
  useToken?: boolean;
  useEncrypt?: boolean;
  loading?: InterfaceLoading;
}

export class Interface implements InterfaceOptions {

  public method: Method;
  public host: string = Host;
  public route: string;
  public useToken: boolean = true;
  public useEncrypt: boolean = true;
  public loading: InterfaceLoading = true;

  public get isGet() { return this.method == 'GET' }
  public get isPost() { return this.method == 'POST' }

  private _loadingSetting: LoadingOptions = null;
  public get loadingSetting(): LoadingOptions {
    if (!this._loadingSetting) {
      let res: LoadingOptions = { title: null };
      if (typeof this.loading == 'function')
        res = this.loading();
      else if (this.loading == undefined || this.loading == true)
        res = Request; // 为空使用默认值
      else if (this.loading == false)
        res.enable = false;
      else
        res = this.loading;

      this._loadingSetting = res;
    }
    return this._loadingSetting;
  }

  constructor(options: InterfaceOptions) {
    Object.assign(this, options);
  }
}

export type RequestErrorHandleFunc = (() => boolean) |
  ((errorData: RequestErrorData) => boolean);

/**
 * 标注网络请求发生错误时的处理函数<p>
 *
 * 示例1：当调用login，服务器返回403错误时<p>
 * 标注了<code>@postErrorHandler(Interface.Login, 0, 403)</code>的函数被执行<p>
 *
 * 示例2：当调用updateToken，服务器正常返回200，但数据的错误码为2时<p>
 * 标注了<code>@postErrorHandler(Interface.UpdateToken, 2)</code>的函数被执行
 *
 *
 * @param interface_ Interface对象
 * @param code 处理的服务器返回状态码
 * @param status 处理的http状态码，默认为200
 */
export function requestErrorHandler(
  interface_: Interface, code: number, status: number = 200) {
  return (obj, key, desc) => {
    networkMgr().registerErrorHandler(interface_, code, status, desc.value);
  }
}

interface RequestErrorData extends ErrorData {
  interface_: Interface
  handled?: boolean
}

class RequestErrorHandler {

  private funcDict: any = {};

  constructor() { }

  private getKey(interface_: Interface) {
    return interface_.host + interface_.route;
  }

  public register(func: RequestErrorHandleFunc, interface_: Interface | RequestErrorData,
    status?: number, code?: number) {
    if (interface_ instanceof Interface) {
      const key = this.getKey(interface_);
      this.funcDict[key] ||= {};
      this.funcDict[key][status] ||= {};
      this.funcDict[key][status][code] = func;

    } else this.register(func, interface_.interface_,
      interface_.status, interface_.code);
  }

  public getHandler(interface_: Interface | RequestErrorData,
    status?: number, code?: number): RequestErrorHandleFunc {
    if (interface_ instanceof Interface) {
      const key = this.getKey(interface_);
      if (!this.funcDict[key]) return null;
      if (!this.funcDict[key][status]) return null;
      return this.funcDict[key][status][code];

    } else return this.getHandler(interface_.interface_,
      interface_.status, interface_.code);
  }

  public handle(errorData: RequestErrorData): boolean {
    let func = this.getHandler(errorData);
    if (!func) return false;

    if (errorData.handled) return;

    const res = func(errorData);
    return errorData.handled = res == null ? true : res;
  }
}

export function networkMgr(): NetworkManager {
  return getManager(NetworkManager);
}

@manager
class NetworkManager extends BaseManager {

  private errorHandler: RequestErrorHandler = new RequestErrorHandler();

  /**
   * 发起请求
   */
  public async request<T = any>(
    interface_: InterfaceParam, data: object = {}): Promise<T> {

    const interface__: Interface =
      typeof interface_ == "function" ? interface_() : interface_;

    data = DataLoader.convert(data);
    const dataStr = this.makeQueryParam(data, interface__.useEncrypt);

    let url = interface__.host + interface__.route;
    if (interface__.isGet) url += "?" + dataStr;

    const header = {
      "Content-Type": "application/x-www-form-urlencoded"
    }

    if (interface__.useToken)
      header["Token"] = appMgr().getToken();

    // const useLoading = await loadingMgr().showLoading(interface__.loadingSetting);

    return new Promise<T>((resolve, reject) => {
      wx.request<T>({
        url, data: dataStr, header,
        timeout: DefaultTimeOut,
        method: interface__.method,
        success: res => {
          console.log("Request success:", interface__, res);

          // 从response里获取数据
          let json, code, data;
          json = res.data;
          code = json["code"] || 0;
          data = json["data"] || json;

          console.log("Response JSON: ", json, code, data);

          // 完全成功
          if (res.statusCode >= 200 &&
            res.statusCode < 300 && code === 0)
            return resolve(data);

          // 如果服务器错误或解析不到JSON
          // json为object：自定义错误，否则为系统错误
          let errMsg, detail = "";
          if (typeof json == "object") {
            errMsg = json["errMsg"];
            detail = json["detail"];
          } else {
            errMsg = "系统错误：" + res.statusCode;
            data = res.data;
          }

          const errData: RequestErrorData = {
            interface_: interface__, status: res.statusCode,
            code, errMsg, detail, data
          };
          this.handleError(errData);
          reject(errData);
        },
        fail: res => {
          console.log("Request fail:", interface__, res);
          const errData: RequestErrorData = {
            interface_: interface__, code: 0, errMsg: res.errMsg, data: res
          };
          reject(errData)
        },
        complete: () => {
          // if (useLoading) loadingMgr().hideLoading();
        }
      })
    })
  }

  private makeQueryParam(data, useEncrypt) {
    return StringUtils.makeQueryParam(data);
  }

  private handleError(errorData: RequestErrorData) {
    let success = this.errorHandler.handle(errorData);
    if (!success) alertMgr().handleError(errorData);
  }

  public registerErrorHandler(interface_: Interface, code: number, status: number, func: RequestErrorHandleFunc) {
    this.errorHandler.register(func, interface_, status, code);
  }
}

import { appMgr } from "./AppManager";
import { ErrorData } from "./ErrorManager";
