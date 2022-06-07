import {field} from "../../modules/core/data/DataLoader";
import {page, pageFunc} from "../common/PageBuilder";
import {BasePageData} from "../common/core/BasePage";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {CanvasPage, waitForCanvas} from "../common/partPages/CanvasPage";
import {ItemDetailPage} from "../common/pages/ItemDetailPage";
import {Room} from "../../modules/room/data/Room";
import {Focus, FocusTags, RuntimeFocus} from "../../modules/focus/data/Focus";
import {waitForDataLoad} from "../../modules/core/managers/DataManager";
import {waitForLogin} from "../../modules/player/managers/PlayerManager";
import {focusMgr} from "../../modules/focus/managers/FocusManager";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {alertMgr} from "../../modules/core/managers/AlertManager";
import {ShopPage} from "../shop/ShopPage";
import {blockLoading} from "../../modules/core/managers/LoadingManager";
import {RoomMessage, roomMgr} from "../../modules/room/managers/RoomManager";
import SystemInfo = WechatMiniprogram.SystemInfo;
import CustomEvent = WechatMiniprogram.CustomEvent;
import {RoomDrawingPage, RoomPage} from "../common/partPages/RoomPage";
import {appMgr} from "../../modules/core/managers/AppManager";
import {RewardGroup} from "../../modules/player/data/Reward";
import {BaseData} from "../../modules/core/data/BaseData";
import {LevelCalculator} from "../../modules/player/utils/LevelCalculator";

type WindowType = "Start" | "Room" | "Tags";

const AccThreshold = 0.3;
const DebugTimeRate = 1000;

type Message = {
  name?: string
  status?: string
}

export class ResultAnimation extends BaseData {

  @field(Number)
  gold: number = 0
  @field(Number)
  exp: number = 0
  @field(Number)
  expRate: number
  @field(Number)
  restExp: number
  @field(Number)
  level: number

  private curExp: number = 0
  private curGold: number = 0
  private targetExp: number
  private targetGold: number
  private baseExp: number

  public static create(exp, gold, baseExp) {
    const res = new ResultAnimation();
    res.targetExp = exp;
    res.targetGold = gold;
    res.baseExp = baseExp;
    return res;
  }

  public update() {
    let rate = (this.targetGold - this.curGold) / 16;
    if (rate >= 0.0001) this.curGold += rate;
    rate = (this.targetExp - this.exp) / 16;
    if (rate >= 0.0001) this.curExp += rate;
    this.gold = Math.round(this.curGold);
    this.exp = Math.round(this.curExp);
  }

  public refresh() {
    const exp = this.baseExp + this.exp;
    this.level = LevelCalculator.level(exp);
    this.expRate = LevelCalculator.expRate(exp);
    this.restExp = LevelCalculator.restExp(exp);
  }
}

export class MainPageData extends BasePageData {

  @field(Room)
  item: Room
  @field(Focus)
  focus: Focus

  @field
  isShowStartWindow: boolean = false
  @field
  isShowRoomWindow: boolean = false
  @field
  isShowTagsWindow: boolean = false
  @field
  isShowResultWindow: boolean = false

  @field
  focusTags: string[] = FocusTags

  @field(RuntimeFocus)
  runtimeFocus: RuntimeFocus

  @field(ResultAnimation)
  resAni: ResultAnimation;

  @field
  isDown: boolean = false

  @field
  focusing: number = 0;
  @field(Array)
  messages: Message[] = [];
}


export const RoomType = "room";

const FocusUpdateInterval = 10000; // 5秒更新一次

@page("main", "主页")
export class MainPage<P = {}> extends ItemDetailPage<MainPageData, Room, P> {

  public data = new MainPageData();

  private sys: SystemInfo;
  private lastFocusUpdateTime = 0;

  /**
   * 部分页
   */
  public playerPage: PlayerPage = new PlayerPage(true, true);
  // public roomPage: RoomPage = new RoomPage();
  public roomDrawingPage: RoomDrawingPage = new RoomDrawingPage();

  // region 初始化

  async onLoad(e) {
    console.log("onLoad")
    await super.onLoad(e);
    await this.initialize();
  }
  async onShow() {
    console.log("onShow")
    await super.onShow();
    await this.refresh();
    await this.enterRoom();
  }
  async onHide() {
    await super.onHide();
    await this.leaveRoom();
  }

  async onUnload() {
    wx.offAccelerometerChange(() => {});
    if (this.data.runtimeFocus) {
      await this.onFailed("界面退出");
      await alertMgr().showToast("由于页面退出，您已取消专注");
    }
  }

  private async initialize() {
    // await this.refresh();
    this.setupWxListeners();
  }

  @waitForLogin
  @waitForDataLoad
  private async refresh() {
    await this.loadRoom();
    await this.playerPage.resetPlayer();
    await this.roomDrawingPage.draw(this.item);
  }

  protected getRoom() {
    return roomMgr().getSelfRoom();
  }
  protected get roomIndex() {
    return {roomId: this.item.roomId}
  }

  private async loadRoom() {
    // const room = Room.testData();
    const room = await this.getRoom();
    await this.setItem(room);
  }

  private setupWxListeners() {
    wx.onAccelerometerChange(res =>
      this.setData({ isDown: res.z >= AccThreshold })
    );
    wx.enableAlertBeforeUnload({
      message: "退出将无法完成本次专注，您确定要退出吗？"
    });
  }

  // endregion

  // region 状态

  public get isFocusing() {
    return this.data.runtimeFocus?.isValid;
  }

  // endregion

  // region 房间操作

  public async enterRoom() {
    await roomMgr().enterRoom(this.roomIndex,
      e => this.onRoomMessage(e))
  }

  public async leaveRoom() {
    await roomMgr().leaveRoom();
  }

  // endregion

  // region 更新

  update() {
    super.update();
    this.updateDown();
    this.updateTime();
    this.updateFocus();
    this.updateResult();
    this.roomDrawingPage.update(this.isFocusing);
  }
  private updateDown() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus) return;
    runtimeFocus.isDown = this.data.isDown;
    this.setData({ runtimeFocus })
  }
  private updateTime() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus) return;

    const rate = appMgr().isDebug ? DebugTimeRate : 1;
    const dt = pageMgr().deltaTime * rate;

    if (!runtimeFocus.isValid) {
      if (runtimeFocus.invalidTime == 0) // 初次
        runtimeFocus.invalidCount++;
      runtimeFocus.invalidTime += dt;
    } else {
      runtimeFocus.invalidTime = 0;
      runtimeFocus.elapseTime += dt;
    }
    runtimeFocus.realTime += dt; // 实际经过的时间

    if (runtimeFocus.isSuccess) {
      this.onSuccess();
      this.setData({ runtimeFocus: null });
    } else if (runtimeFocus.isFailed) {
      this.onFailed();
      this.setData({ runtimeFocus: null });
      alertMgr().showToast("好遗憾，专注失败了，调整状态再来一次吧！");
    } else
      this.setData({ runtimeFocus });
  }
  private updateFocus() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus) return;

    const now = Date.now();
    if (now - this.lastFocusUpdateTime
      <= FocusUpdateInterval) return;
    this.lastFocusUpdateTime = now;

    focusMgr().updateFocus(runtimeFocus);
  }
  private updateResult() {
    const resAni = this.data.resAni;
    if (!resAni) return;
    resAni.update();
    this.setData({resAni});
  }

  // endregion

  // region 事件

  private async onRoomMessage(data: RoomMessage) {
    console.log("onRoomMessage", data);

    await this.setData({
      // 如果有人当前专注中的数据，使用之，否则如果当前玩家在专注，设置为1，否则为0
      focusing: data.count || (this.data.runtimeFocus ? 1 : 0)
    })

    const name = data.player.name; let status;
    switch (data.type) {
      case "enter": status = "进入房间"; break
      case "focusStart": status = "开始专注"; break
      case "focusEnd": status = "结束专注"; break
      case "leave": status = "离开房间"; break
    }
    if (!status) return;

    const messages = this.data.messages
    messages.unshift({name, status});
    await this.setData({ messages });

    // const messages=this.data.messages
    // this.setData({
    //   focusing:!(data.count)?0:(data.count!=0?data.count:(data.type=="focusing"?1:0))
    // })
    // console.log("focusing", this.data.focusing);
    // switch (data.type){
    //   case "enter":
    //     var obj1={
    //       name:data.player.name,
    //       status:"进入房间"
    //     }
    //     messages.unshift(obj1);
    //     this.setData({messages})
    //     break;
    //   case "focusStart":
    //     var obj2={
    //       name:data.player.name,
    //       status:"已开始专注"
    //     }
    //     messages.unshift(obj2);
    //     this.setData({messages})
    //     break;
    //   case "focusEnd":
    //     var obj3={
    //       name:data.player.name,
    //       status:"已结束专注"
    //     }
    //     messages.unshift(obj3);
    //     this.setData({messages})
    //     break;
    //   case "leave":
    //     var obj4={
    //       name:data.player.name,
    //       status:"已离开房间"
    //     }
    //     messages.unshift(obj4);
    //     this.setData({messages})
    //     break;
    // }
  }

  // region 窗口事件

  @pageFunc
  async onClickShow(e) {
    const window = e.currentTarget.dataset.window;
    await this[`on${window}WindowShow`]?.();
    await this.setData({ [`isShow${window}Window`]: true })
  }
  @pageFunc
  async onClickHide(e) {
    const window = e.currentTarget.dataset.window;
    await this[`on${window}WindowHide`]?.();
    await this.setData({ [`isShow${window}Window`]: false })
  }

  async onStartWindowShow() {
    const focus = Focus.emptyData(
      this.playerPage.openid, {
        roomId: this.item.roomId
      })
    await this.setData({focus});
  }

  // endregion

  // region 专注相关

  @pageFunc
  private onDragTime(e) {
    const focus = this.data.focus;
    focus.duration = Number(e.detail.value);
    this.setData({ focus })
  }

  @pageFunc
  private onTagTab(e) {
    const index = e.currentTarget.dataset.index;
    const focus = this.data.focus;
    focus.tagIdx = Number(index);
    this.setData({ focus })
  }

  @pageFunc
  private onModeTab(e) {
    const index = e.currentTarget.dataset.index;
    const focus = this.data.focus;
    focus.mode = Number(index);
    this.setData({ focus })
  }

  @pageFunc
  private onNoteInput(e) {
    const focus = this.data.focus;
    focus.note = e.detail.value;
    this.setData({ focus })
  }

  @pageFunc
  private async onSubmit() {
    // const focus = this.data.focus;
    // TODO: 离线测试
    const {tagIdx, mode, duration} = this.data.focus;
    const focus = await focusMgr().startFocus(tagIdx, mode, duration);
    await this.setData({
      focus, runtimeFocus: RuntimeFocus.create(focus),
      isShowStartWindow: false
    })
  }

  @pageFunc
  private async onFinalConfirm() {
    const {id, tagIdx, note} = this.data.focus;
    await focusMgr().editFocus(id, tagIdx, note);
    await this.setData({
      isShowResultWindow: false,
      // resAni: null
    });
    this.playerPage.resetPlayer();
  }

  @pageFunc
  private async onCancelTap() {
    const res = await alertMgr().showAlert(
      "确定要取消专注吗？取消专注将不会获得任何奖励", true);
    if (res.confirm) {
      await this.onFailed("用户取消专注");
      await alertMgr().showToast("您已取消专注");
    }
  }

  private async onSuccess() {
    const baseExp = this.playerPage.player.exp;
    const focus = await focusMgr().endFocus(
      this.data.runtimeFocus);
    const exp = focusMgr().curRewards.exp.realValue;
    const gold = focusMgr().curRewards.gold.realValue;
    await this.setData({
      focus, runtimeFocus: null, isShowResultWindow: true,
      resAni: ResultAnimation.create(exp, gold, baseExp)
    })
  }

  private async onFailed(reason = "专注失败") {
    const focus = await focusMgr().cancelFocus("专注失败");
    await this.setData({ focus, runtimeFocus: null })
  }

  // endregion

  // region 其他事件

  @pageFunc
  @blockLoading
  async onRoomNameBlur(e: CustomEvent) {
    const name = e.detail.value;
    await roomMgr().editRoomInfo({name});
    await alertMgr().showToast("修改房间名成功", "success")
  }

  @pageFunc
  onShopTap() { pageMgr().push(ShopPage); }

  // endregion

  // endregion
}
