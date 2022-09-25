import {DataLoader, field} from "../../modules/core/data/DataLoader";
import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {Room} from "../../modules/room/data/Room";
import {Focus, FocusTags, RuntimeFocus} from "../../modules/focus/data/Focus";
import {waitForDataLoad} from "../../modules/core/managers/DataManager";
import {playerMgr, waitForLogin} from "../../modules/player/managers/PlayerManager";
import {focusMgr} from "../../modules/focus/managers/FocusManager";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {alertMgr} from "../../modules/core/managers/AlertManager";
import {ShopPage} from "../shop/ShopPage";
import {blockLoading, showLoading} from "../../modules/core/managers/LoadingManager";
import {RoomMessage, roomMgr} from "../../modules/room/managers/RoomManager";
import CustomEvent = WechatMiniprogram.CustomEvent;
import {RoomDrawingPage, RoomPage} from "../common/partPages/RoomPage";
import {appMgr} from "../../modules/core/managers/AppManager";
import {BaseData} from "../../modules/core/data/BaseData";
import {LevelCalculator} from "../../modules/player/utils/LevelCalculator";
import {ShareAppPage, ShareTimelinePage} from "../common/partPages/SharePage";

// type WindowType = "Start" | "Room" | "Tags";

const AccThreshold = 0.3;
const DebugTimeRate = 100;

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
  @field
  motionList:Motion[] = []
  @field
  motionCountList:number[] = []

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
  room: Room
  @field(Focus)
  focus: Focus

  // region 窗口

  @field
  isShowStartWindow: boolean = false
  @field
  isShowRoomWindow: boolean = false
  @field
  isShowTagsWindow: boolean = false
  @field
  isShowResultWindow: boolean = false
  @field
  isShowTipsWindow: boolean = false

  // endregion

  @field([String])
  whiteNoises = [
    "whiteNoise1", "whiteNoise2", "whiteNoise3", "whiteNoise4"
  ]
  @field
  curWhiteNoiseIdx = -1;

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

const FocusUpdateInterval = 1000; // 1秒更新一次

@page("main", "主页")
export class MainPage<P = {}> extends BasePage<MainPageData, P> {

  public data = new MainPageData();

  protected isEntered = false;

  /**
   * 部分页
   */
  public playerPage = new PlayerPage(true, true);
  public roomDrawingPage = new RoomDrawingPage();
  public shareAppPage = new ShareAppPage();
  public themePage = new ThemePage()
  // public roomPage = new RoomPage()
  // public shareTimelinePage: ShareTimelinePage = new ShareTimelinePage();

  // region 数据访问

  public get room() { return this.data.room }

  // endregion

  // region 初始化

  async onLoad(e) {
    console.log("onLoad")
    this.audio = wx.getBackgroundAudioManager();

    await super.onLoad(e);
    await this.initialize();
    await this.checkCurFocusing();
    // this.testAudio();
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
    if (this.data.runtimeFocus) {
      await this.onFocusFailed("界面退出");
      await alertMgr().showToast("由于页面退出，您已取消专注");
    }
    this.releaseWxListeners();
  }

  private async initialize() {
    // await this.refresh();
    this.setupWxListeners();
  }
  private setupWxListeners() {
    // 反扣传感器
    wx.onAccelerometerChange(res =>
      this.setData({ isDown: res.z >= AccThreshold })
    );
  }
  private releaseWxListeners() {
    wx.offAccelerometerChange(() => {});
  }

  /**
   * 检查当前专注
   */
  private async checkCurFocusing() {
    const focus = playerMgr().extra?.focus;
    if (focus) await this.processCurFocusing(DataLoader.load(Focus, focus))
  }
  protected async processCurFocusing(focus: Focus) {
    if (await focus.inSelfRoom()) {
      await PromiseUtils.waitFor(() => this.room && this.isEntered);
      await this.onFocusStart(focus)
      playerMgr().extra.focus = null; // 处理完毕
    } else if (!focus.inNPCRoom())
      await pageMgr().push(VisitPage, {roomId: focus.roomId});
    else {} // NPC房间
  }

  // endregion

  // region 绘制

  @showLoading
  @waitForLogin
  @waitForDataLoad
  private async refresh() {
    await this.loadRoom();
    await this.playerPage.resetPlayer();
    await this.roomDrawingPage.draw(this.room);

    this.shareAppPage.extra = {
      code: playerMgr().player.inviteCode
    };
  }

  // endregion

  // region 白噪音控制

  private audio: BackgroundAudioManager;

  public selectWhiteNoise(idx) {
    if (this.data.curWhiteNoiseIdx == idx) idx = -1;
    this.setData({ curWhiteNoiseIdx: idx })
    if (idx >= 0) {
      const wns = whiteNoiseRepo().findByType(idx);
      this.playAudio(MathUtils.randomPick(wns));
    } else this.stopAudio();
  }

  private playAudio(wn: WhiteNoise) {
    if (!wn) return;

    this.audio.src = wn.src;
    this.audio.title = wn.title;
    this.audio.epname = wn.epname;
    this.audio.singer = wn.singer;
    this.audio.onEnded(() => this.audio.src = wn.src);
  }
  private stopAudio() {
    this.audio.stop();
    // this.audio.src = null;
  }

  // endregion

  // region 状态

  public get isFocusing() {
    return this.data.runtimeFocus?.isValid;
  }

  // endregion

  // region 房间操作

  // region 房间获取

  protected getRoom() {
    return roomMgr().getSelfRoom();
  }
  protected get roomIndex() {
    return {roomId: this.room.roomId}
  }

  private async loadRoom() {
    // const room = Room.testData();
    const room = await this.getRoom();
    await this.setData({room: room});
  }

  // endregion

  public async enterRoom() {
    await roomMgr().enterRoom(this.roomIndex,
      e => this.onRoomMessage(e));
    this.isEntered = true;
  }

  public async leaveRoom() {
    await roomMgr().leaveRoom();
    this.isEntered = false;
  }

  // endregion

  // region 更新

  private lastUpdateTime = 0;

  update() {
    super.update();
    this.updateDown();
    this.updateTime();
    this.updateResult();
    this.roomDrawingPage.update(this.isFocusing);
  }
  private updateDown() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus) return;
    runtimeFocus.isDown = this.data.isDown;
    this.setData({ runtimeFocus })
  }
  private updateTime(runtimeFocus?: RuntimeFocus) {
    runtimeFocus ||= this.data.runtimeFocus;
    if (!runtimeFocus) return;

    const now = Date.now();
    if (this.lastUpdateTime > 0)
      this.updateFocusTime(runtimeFocus,
        now - this.lastUpdateTime);
    this.lastUpdateTime = now;
    // const dt = pageMgr().deltaTime * rate;
  }
  private updateFocusTime(runtimeFocus: RuntimeFocus, dt) {
    dt *= appMgr().isDebug ? DebugTimeRate : 1;
    // console.warn("updateFocusTime", dt);

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
      this.onFocusSuccess();
      this.onFocusEnd();
    } else if (runtimeFocus.isFailed) {
      this.onFocusFailed();
      this.onFocusEnd();
      alertMgr().showToast("好遗憾，专注失败了，调整状态再来一次吧！");
    } else
      this.setData({ runtimeFocus });
  }
  private updateResult() {
    const resAni = this.data.resAni;
    if (!resAni) return;
    resAni.update();
    this.setData({resAni});
  }

  // region 专注更新

  private focusUpdateTask;
  private startFocusUpdate() {
    this.lastUpdateTime = 0;
    this.focusUpdateTask ||= setInterval(
      () => this.updateFocus(), FocusUpdateInterval
    )
  }
  private stopFocusUpdate() {
    clearInterval(this.focusUpdateTask);
    this.focusUpdateTask = null;
  }
  private updateFocus() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus) return;

    this.updateTime(runtimeFocus);
    focusMgr().updateFocus(runtimeFocus);
  }

  // endregion

  // endregion

  // region 事件

  private async onRoomMessage(data: RoomMessage) {
    console.log("onRoomMessage", data);

    // await this.setData({
    //   // 如果有人当前专注中的数据，使用之，否则如果当前玩家在专注，设置为1，否则为0
    //   focusing: data.count // || (this.data.runtimeFocus ? 1 : 0)
    // })
    const name = data.player.name; let status;
    switch (data.type) {
      case "enter": status = "进入房间"; break
      case "focusStart": status = "开始专注"; break
      case "focusEnd": status = "结束专注"; break
      case "leave": status = "离开房间"; break
      case "switchMotion":
        this.roomDrawingPage.switchMotions(data.motionRecord);break;
    }
    if (!status) return;

    const focusing = data.count == undefined ?
      this.data.focusing : data.count;
    const messages = this.data.messages;
    messages.unshift({name, status});
    await this.setData({ focusing, messages });
  }

  // region 窗口事件

  // WindowType = "Start" | "Room" | "Tags" | "Result";
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
        roomId: this.room.roomId
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
    await this.onFocusStart();
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
      await this.onFocusFailed("用户取消专注");
      await alertMgr().showToast("您已取消专注");
      this.onFocusEnd();
    }
  }

  @showLoading
  protected async onFocusStart(focus?) {
    let runtimeFocus: RuntimeFocus;
    if (!focus) {
      const {tagIdx, mode, duration} = this.data.focus;
      focus = await focusMgr().startFocus(
        tagIdx, mode, duration, this.roomIndex);
      runtimeFocus = RuntimeFocus.create(focus);
    } else {
      focus = await focusMgr().continueFocus();
      runtimeFocus = focus.runtime;
    }
    await this.setData({
      focus, runtimeFocus, isShowStartWindow: false
    })
    wx.enableAlertBeforeUnload({
      message: "退出将无法完成本次专注，您确定要退出吗？"
    });
    this.startFocusUpdate();
  }

  private async onFocusSuccess() {
    const baseExp = this.playerPage.player.exp;
    const focus = await focusMgr().endFocus(
      this.data.runtimeFocus);
    const exp = focusMgr().curRewards.exp.realValue;
    const gold = focusMgr().curRewards.gold.realValue;

    let motionList:Motion[] = [];
    let motionCountList:number[] = [];
    focus.runtime.motionRecords.forEach((value)=>{

      const res = motionRepo().getById(value.motionId);
      let index = motionList.indexOf(res);
      if(index!=-1)motionCountList[index]++
      else {
        motionList.push(res);
        motionCountList[motionList.length-1] = 1;
      }

    })

    await this.setData({
      focus, runtimeFocus: null, isShowResultWindow: true, motionList,motionCountList,
      resAni: ResultAnimation.create(exp, gold, baseExp)
    })
  }

  private async onFocusFailed(reason = "专注失败") {
    const focus = await focusMgr().cancelFocus("专注失败");
    await this.setData({
      focus, runtimeFocus: null
    })
  }

  private onFocusEnd() {
    wx.disableAlertBeforeUnload();
    this.setData({ runtimeFocus: null })
    this.stopFocusUpdate();
    this.stopAudio();
  }

  // endregion

  // region 其他事件

  @pageFunc
  async onWhiteNoiseTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.selectWhiteNoise(index);
  }

  @pageFunc
  @blockLoading
  async onRoomNameBlur(e: CustomEvent) {
    const name = e.detail.value;
    await roomMgr().editRoomInfo({name});
    await alertMgr().showToast("修改房间名成功", "success")
  }

  // 解决中文拼音输入受限问题
  @pageFunc
  private onRoomNameChange(e) {
    let value = e.detail.value
    if (value.length < 7) return
    // 在长度超过十位时，对字符串进行截取，并重新赋值
    value = value.substr(0, 6)
    this.setData({
      "item.name":value
    })
  }

  @pageFunc
  onShopTap() { pageMgr().push(ShopPage); }

  // endregion

  // endregion
}
import {VisitPage} from "../visit/VisitPage";
import {PromiseUtils} from "../../utils/PromiseUtils";
import {WhiteNoise, whiteNoiseRepo} from "../../modules/room/data/WhiteNoise";
import {MathUtils} from "../../utils/MathUtils";
import BackgroundAudioManager = WechatMiniprogram.BackgroundAudioManager;
import {Motion, motionRepo} from "../../modules/room/data/Motion";
import {ThemePage} from "../common/partPages/ThemePage";
