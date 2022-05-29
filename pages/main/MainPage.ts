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

type WindowType = "Start" | "Room" | "Tags";

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
  focusTags: string[] = FocusTags

  @field(RuntimeFocus)
  runtimeFocus: RuntimeFocus

  @field
  isDown: boolean = false

}

export const RoomType = "room";

@page("main", "主页")
export class MainPage extends ItemDetailPage<Data, Room> {

  public data = new Data();

  /**
   * 部分页
   */
  public playerPage: PlayerPage = new PlayerPage(true, true);
  public canvasPage: CanvasPage = new CanvasPage();

  // region 初始化

  async onLoad(e) {
    await super.onLoad(e);
    await this.initialize();
  }

  @waitForLogin
  @waitForDataLoad
  private async initialize() {
    await this.loadRoom();
    this.createConnection();
    await this.refresh();
  }

  private async loadRoom() {
    await this.setItem(Room.testData());
  }

  private createConnection() {
    wsMgr().connect(RoomType, [this.item.roomId],
      data => this.onRoomMessage(data));
  }

  // endregion

  // region 更新

  update() {
    super.update();
    this.updateTime();
  }

  updateTime() {
    const runtimeFocus = this.data.runtimeFocus;
    if (!runtimeFocus.isValid) return;

    const dt = pageMgr().deltaTime;
    runtimeFocus.elapseTime += dt;
    this.setData({ runtimeFocus });
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
  onDragTime(e) {
    const focus = this.data.focus;
    focus.duration = Number(e.detail.value);
    this.setData({ focus })
  }

  @pageFunc
  onTagTab(e) {
    const index = e.currentTarget.dataset.index;
    const focus = this.data.focus;
    focus.tagIdx = Number(index);
    this.setData({ focus })
  }

  @pageFunc
  onModeTab(e) {
    const index = e.currentTarget.dataset.index;
    const focus = this.data.focus;
    focus.mode = Number(index);
    this.setData({ focus })
  }

  @pageFunc
  async onSubmit() {
    const focus = this.data.focus;
    // TODO: 离线测试
    // const {tagIdx, mode, duration} = this.data.focus;
    // const focus = await focusMgr().startFocus(tagIdx, mode, duration);
    await this.setData({
      focus, runtimeFocus: RuntimeFocus.create(focus),
      isShowStartWindow: false
    })
  }

  // endregion

  // endregion

  // region 界面绘制

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
    bg.alpha = 0.25; // Debug模式

    this.canvasPage.add(bg);
  }
  private async drawHouse() {
    const sp = await this.canvasPage.createSprite("../../assets/common/3.png");

    sp.x = this.canvasPage.width / 2;
    sp.y = this.canvasPage.height / 2;

    sp.scale.x = sp.scale.y = 0.8;
    sp.anchor.x = 0.5;
    sp.anchor.y = 0.75;

    sp.alpha = 0.25; // Debug模式

    this.canvasPage.add(sp);
  }

  // endregion

}
