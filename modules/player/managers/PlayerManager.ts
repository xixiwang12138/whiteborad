import {get, Itf, post} from "../../core/BaseAssist";
import {BaseManager, getManager, manager} from "../../core/managers/BaseManager";
import {appMgr} from "../../core/managers/AppManager";
import {storageMgr} from "../../core/managers/StroageManager";
import {Player, PlayerData, PlayerEditableInfo, PlayerState, WxUserInfo} from "../data/Player";
import {PromiseUtils} from "../../../utils/PromiseUtils";
import {blockLoading} from "../../core/managers/LoadingManager";
import {DataLoader} from "../../core/data/DataLoader";
import {handleError} from "../../core/managers/ErrorManager";
import {Constructor} from "../../core/BaseContext";

export type LoginExtra = {
  focus?: Partial<Focus>
}

const Login: Itf<{
    openid: string, userInfo: WxUserInfo
  }, {
    player: Partial<Player>,
    token: string,
    data: {[T: string]: Partial<PlayerData>},
    extra: LoginExtra
  }> = post("/player/player/login", false);
const Logout: Itf = post("/player/player/logout");
const GetOpenid: Itf<{code: string}, {openid: string}>
  = post("/player/openid/get", false);
const GetPhone: Itf<{code: string}, {phone: string}>
  = post("/player/phone/get");
const GetPlayerData: Itf<{}, {data: {[T: string]: Partial<PlayerData>}}>
  = post("/player/player_data/get");
const GetPlayerInfo: Itf<{}, {player: Player}>
  = get("/player/player_info/get");
const EditPlayerInfo: Itf<{info: PlayerEditableInfo}, {}>
  = post("/player/player_info/edit");
const InvitePlayer: Itf<{inviteCode: string}, {}>
  = post("/player/player/invite");
const ClaimInvite: Itf<{index: number}>
  = post("/player/task/claim_invite");
const UseRewardCode: Itf<{code: string}, {data: Partial<RewardCode>}>
  = post("/player/reward_code/use");

export function playerData<T extends PlayerData>(name: string) {
  return (clazz: Constructor<T>) =>
    playerMgr().registerData(clazz, name);
}

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

  /**
   * 登陆额外数据
   */
  public extra: LoginExtra;

  /**
   * 玩家数据
   */
  public playerData: {[T: string]: PlayerData} = {};
  public playerDataClasses: {[T: string]: Constructor} = {};

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
  // @showLoading
  @blockLoading
  @handleError(true)
  public async login(userInfo?: WxUserInfo) {
    // 如果已经登陆了，直接返回用户数据
    if (this.isLogin) return this.player;

    // 如果没有userInfo缓存，则自动登陆失败
    if (!(userInfo ||= this.player)) return null;
    // 否则，可以进行自动登录

    // 如果没有openid缓存，手动获取openid
    this.openid ||= await this.getOpenid();

    const res = await Login({
      openid: this.openid, userInfo
    });
    appMgr().setupToken(res.token);
    this.setAllData(res.data); this.extra = res.extra;
    return this.player = DataLoader.load(Player, res.player);
  }

  /**
   * 登出
   */
  public async logout() {
    if (!this.isLogin) return;
    await Logout();
    appMgr().clearToken();
    this.clearAllData();
    this.player = null;
  }

  /**
   * 手动登录
   */
  // @showLoading
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
    const res = await GetPlayerInfo();
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

  // region 玩家数据操作

  /**
   * 注册玩家数据
   */
  public registerData<T extends PlayerData>(
    clazz: Constructor<T>, name: string) {
    this.playerDataClasses[name] = clazz;
  }

  /**
   * 获取玩家数据名
   */
  public getDataName<T extends PlayerData>(
    clazz: Constructor<T>) {
    for (const key in this.playerDataClasses) {
      const pdClazz = this.playerDataClasses[key];
      if (clazz == pdClazz) return key;
    }
  }

  /**
   * 获取玩家数据类
   */
  public getDataClass<T extends PlayerData>(name: string) {
    return this.playerDataClasses[name];
  }

  /**
   * 获取玩家数据
   * @param clazz 需要获取的数据类型
   */
  public getData<T extends PlayerData>(clazz: Constructor<T>): T {
    return this.playerData[this.getDataName(clazz)] as T;
  }

  /**
   * 刷新玩家数据
   * @param clazz 需要刷新的数据类型，默认刷新全部数据
   */
  public async refreshData<T extends PlayerData>(
    clazz?: Constructor<T>) {
    if (clazz) {
      const name = this.getDataName(clazz);
      const res = await GetPlayerData({name});
      this.setData(clazz, res.data);
    } else {
      const res = await GetPlayerData();
      this.setAllData(res.data);
    }
  }

  /**
   * 设置玩家数据
   */
  public setData<T extends PlayerData>(
    clazz: Constructor<T>, data: object) {
    const name = this.getDataName(clazz);
    if (name) this.playerData[name] = DataLoader.load(clazz, data);
  }

  /**
   * 设置玩家数据
   */
  public setAllData<T extends PlayerData>(dict: object) {
    for (const key in dict) {
      const clazz = this.getDataClass(key);
      if (clazz) this.setData(clazz, dict[key]);
    }
  }

  /**
   * 清除玩家数据
   */
  public clearAllData() {
    this.playerData = {};
  }

  // endregion

  // region 业务逻辑

  /**
   * 修改信息
   * @param info
   */
  public async editInfo(info: PlayerEditableInfo) {
    await EditPlayerInfo({info})
    this.player.edit(info);
  }

  /**
   * 邀请玩家（被邀请）
   */
  public async invitePlayer(inviteCode: string) {
    if (this.player.state != PlayerState.Newer) return;
    await InvitePlayer({inviteCode});
    this.player.inviteeCode = inviteCode;
  }

  public async useRewardCode(code) {
    const useRes = await UseRewardCode({code});
    const res = DataLoader.load(RewardCode, useRes.data);
    res.rewardGroup().invoke();
    return res;
  }

  /**
   * 邀请玩家
   */
  public async claimInvite(index: number) {
    const pt = playerMgr().getData(PlayerTask);
    if (pt.inviteTask.claimedRewards.includes(index))
      throw "奖励已领取！";

    const config = configMgr().config(InviteConfig);
    // 处理条件
    config.conditions(index).process();

    await ClaimInvite({index});

    pt.claim(index);
    config.rewards(index).invoke();

    return pt;
  }

  // endregion
}

import {RewardCode} from "../data/RewardCode";
import {Focus} from "../../focus/data/Focus";
import {PlayerTask} from "../data/PlayerTask";
import {configMgr} from "../../core/managers/ConfigManager";
import InviteConfig from "../config/InviteConfig";
