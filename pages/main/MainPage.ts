import {field} from "../../modules/core/data/DataLoader";
import { page, pageFunc } from "../common/PageBuilder";
import { BasePage, BasePageData } from "../common/core/BasePage";
import { PlayerPage } from "../common/partPages/PlayerPage";
import { CanvasPage, onCanvasSetup } from "../common/partPages/CanvasPage";
import {wsMgr} from "../../modules/websocket/WebSocketManager";
import {ItemDetailPage} from "../common/pages/ItemDetailPage";
import {Room} from "../../modules/room/data/Room";
import {Focus, FocusTags, RuntimeFocus} from "../../modules/focus/data/Focus";
import {input} from "../common/utils/PageUtils";
import {waitForDataLoad} from "../../modules/core/managers/DataManager";
import {waitForLogin} from "../../modules/player/managers/PlayerManager";
import {focusMgr} from "../../modules/focus/managers/FocusManager";
import {pageMgr} from "../../modules/core/managers/PageManager";
import SystemInfo = WechatMiniprogram.SystemInfo;
import {alertMgr} from "../../modules/core/managers/AlertManager";
import {ShopPage} from "../shop/ShopPage";
import { Sprite } from "pixi.js";

type WindowType = "Start" | "Room" | "Tags";

const AccThreshold = 0.3;
const TimeRate = 1000;

class Data extends BasePageData {

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

  @field
  isDown: boolean = false

}

export const RoomType = "room";

const FocusUpdateInterval = 10000; // 5秒更新一次

@page("main", "主页")
export class MainPage extends ItemDetailPage<Data, Room> {

  public data = new Data();

  private sys: SystemInfo;
  private lastFocusUpdateTime = 0;

  /**
   * 部分页
   */
  public playerPage: PlayerPage = new PlayerPage(true, true);
  public canvasPage: CanvasPage = new CanvasPage();

  // region 初始化

  async onLoad(e) {
    this.sys = await wx.getSystemInfo();
    await super.onLoad(e);
    await this.initialize();
  }

  @waitForLogin
  @waitForDataLoad
  private async initialize() {
    await this.loadRoom();
    this.createConnection();
    this.setupWxListeners();
    await this.refresh();
  }

  private async loadRoom() {
    await this.setItem(Room.testData());
  }

  private createConnection() {
    wsMgr().connect(RoomType, [this.item.roomId],
      data => this.onRoomMessage(data));
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

  // region 更新

  update() {
    super.update();
    this.updateDown();
    this.updateTime();
    this.updateFocus();
    this.updateHouseMove();
  }

  updateDown() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus) return;
    runtimeFocus.isDown = this.data.isDown;
    this.setData({ runtimeFocus })
  }

  updateTime() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus) return;

    const rate = this.isDebug ? TimeRate : 1;
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
    } else
      this.setData({ runtimeFocus });
  }

  updateFocus() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus) return;

    const now = Date.now();
    if (now - this.lastFocusUpdateTime
      <= FocusUpdateInterval) return;
    this.lastFocusUpdateTime = now;

    focusMgr().updateFocus(runtimeFocus);
  }

  // endregion

  // region 事件

  private onRoomMessage(data) {
    console.log("onRoomMessage", data);
  }

  // region 窗口事件

  @pageFunc
  async onClickShow(e) {
    const window = e.currentTarget.dataset.window;
    await this[`on${window}WindowShow`]?.();
    await this.setData({ [`isShow${window}Window`]: true })
  }
  @pageFunc
  onClickHide(e) {
    const window = e.currentTarget.dataset.window;
    this.setData({ [`isShow${window}Window`]: false })
  }

  async onStartWindowShow() {
    await this.setData({focus: Focus.emptyData(this.playerPage.openid)});
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

  private async onSuccess() {
    const {tagIdx, note} = this.data.focus;
    const focus = await focusMgr().endFocus(
      this.data.runtimeFocus, tagIdx, note);
    await this.setData({
      focus, runtimeFocus: null,
      isShowResultWindow: true
    })
  }

  private async onFailed() {
    const focus = await focusMgr().cancelFocus("专注失败");
    await this.setData({ focus, runtimeFocus: null })
    await alertMgr().showToast("好遗憾，专注失败了，调整状态再来一次吧！");
  }

  // endregion

  // region 其他事件

  @pageFunc
  onShopTap() { pageMgr().push(ShopPage); }

  // endregion

  // endregion

  // region 界面绘制

  private pixiObj: {
    background?: Sprite,
    house?: Sprite
  } = { };

  public get isDebug() { return this.sys.platform == 'devtools'; }

  @onCanvasSetup
  public async refresh() {
    await this.drawBackground();
    await this.drawHouse();
    this.canvasPage.render();
    console.log("canvasPage", this.canvasPage);
  }

  private async drawBackground() {
    const w = this.canvasPage.width;
    const h = this.canvasPage.height;
    const ctx = this.canvasPage.makeContext(w, h)

    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#C7E1FA");
    grd.addColorStop(1, "#4F8DCC");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    const dataUrl = ctx.canvas.toDataURL();
    const bg = await this.canvasPage.createSprite(dataUrl);
    bg.x = bg.y = 0;
    bg.alpha = this.isDebug ? 0.25 : 1;

    this.canvasPage.add(bg);
    this.pixiObj.background = bg;
  }
  private async drawHouse() {
    const sp = await this.canvasPage.createSprite("../../assets/common/3.png");

    sp.x = this.canvasPage.width / 2;
    sp.y = this.canvasPage.height / 5 * 3;

    sp.scale.x = sp.scale.y = 0.8;
    sp.anchor.x = 0.5;
    sp.anchor.y = 0.75;

    sp.alpha = this.isDebug ? 0.25 : 1;

    this.canvasPage.add(sp);
    this.pixiObj.house = sp;
  }

  private updateHouseMove() {
    const runtimeFocus = this.data.runtimeFocus;
    const focusing = runtimeFocus?.isValid
    if (!focusing) { // 缩小
      const dtScale = (this.pixiObj.house.scale.x - 0.8) / 8;
      if (dtScale <= 0.00001) return;

      this.pixiObj.house.scale.x -= dtScale;
      this.pixiObj.house.scale.y -= dtScale;

    } else { // 放大
      const dtScale = (1 - this.pixiObj.house.scale.x) / 24;
      if (dtScale <= 0.00001) return;

      this.pixiObj.house.scale.x += dtScale;
      this.pixiObj.house.scale.y += dtScale;
    }

    this.canvasPage.render();
  }

  // endregion
}
