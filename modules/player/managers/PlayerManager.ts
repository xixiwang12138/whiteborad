import {Itf, post} from "../../core/BaseAssist";
import {BaseManager, getManager, manager} from "../../core/managers/BaseManager";
import {appMgr} from "../../core/managers/AppManager";
import {storageMgr} from "../../core/managers/StroageManager";
import {Player} from "../data/Player";
import {PromiseUtils} from "../../../utils/PromiseUtils";
import {blockLoading, showLoading} from "../../core/managers/LoadingManager";
import {handleError} from "../../core/managers/AlertManager";
import {DataLoader} from "../../core/data/DataLoader";

const Login: Itf<
  {openid: string, player: Partial<Player>},
  {player: Partial<Player>, token: string}>
  = post("/player/player/login", false);
const Logout: Itf = post("/player/player/logout");
const GetOpenid: Itf<{code: string}, {openid: string}>
  = post("/player/player/get_openid", false);
const GetPhone: Itf<{code: string}, {phone: string}>
  = post("/player/player/get_phone");
const GetInfo: Itf<{}, {player: Player}>
  = post("/player/player/get");

export function waitForLogin(obj, key, desc) {
  const oriFunc = desc.value;
  desc.value = async function (...p) {
    await PromiseUtils.waitFor(() => playerMgr().isLogin);
    return await oriFunc.apply(this, p);
  }
}

export function playerMgr() {
  return getManager(PlayerManager)
}

const UserInfoKey = "userInfo";
const OpenidKey = "openid";

@manager
export class PlayerManager extends BaseManager {

  /**
   * 用户
   */
    // TODO: 这种写法能否使用修饰器简化？
  private _player: Player;
  public get player(): Player {
    return this._player ||= storageMgr().getData(UserInfoKey, Player);
  }
  public set player(val: Player) {
    storageMgr().setData(UserInfoKey, this._player = val);
  }

  /**
   * openid
   */
  private _openid: string;
  public get openid() {
    return this._openid ||= storageMgr().getData(OpenidKey);
  }
  public set openid(val: string) {
    storageMgr().setData(OpenidKey, this._openid = val);
  }

  // region 用户操作

  /**
   * 是否已经登录
   */
  public get isLogin() {
    return !!this._player && !!appMgr().getToken();
  }

  /**
   * 登陆
   * 登陆只会执行一次，要想重新登录，必须先登出
   */
  @showLoading
  @blockLoading
  @handleError(true)
  public async login(player?: Partial<Player>) {
    // 如果已经登陆了，直接返回用户数据
    if (this.isLogin) return this.player;

    // 如果没有userInfo缓存，则自动登陆失败
    if (!(player ||= this.player)) return null;
    // 否则，可以进行自动登录

    // 如果没有openid缓存，手动获取openid
    this.openid ||= await this.getOpenid();

    const res = await Login({
      openid: this.openid, player
    });
    appMgr().setupToken(res.token);

    player = DataLoader.load(Player, res.player);
    return this.player = player as Player;
  }

  /**
   * 登出
   */
  public async logout() {
    if (!this.isLogin) return;
    await Logout();
    appMgr().clearToken();
    this.player = null;
  }

  /**
   * 手动登录
   */
  @showLoading
  @blockLoading
  public async manualLogin(desc?: string) {
    const profile = await wx.getUserProfile({
      desc, // 声明获取用户个人信息后的用途，会展示在弹窗中，请谨慎填写
    });
    // 如果已经登陆了，先登出
    if (this.isLogin) await this.logout();
    return this.login(profile.userInfo);
  }

  /**
   * 获取手机号
   */
  public async getPhone(code: string) {
    const res = await GetPhone({code})
    return res.phone;
  }

  /**
   * 刷新个人信息
   */
  public async refresh() {
    if (!this.isLogin) return;
    const res = await GetInfo();
    const player = DataLoader.load<Player>(Player, res.player);
    return this.player = player;
  }

  /**
   * 获取用户openid
   */
  private async getOpenid() {
    const code = (await this.wxLoginPromise()).code;
    const codeRes = await GetOpenid({code});
    console.log("codeRes:", codeRes);
    return codeRes.openid;
  }
  private wxLoginPromise() {
    return new Promise<any>(resolve => {
      wx.login({success: resolve});
    })
  }

  // endregion

}
