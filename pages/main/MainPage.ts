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
import { Sprite, Container, Texture } from "pixi.js";
import CustomEvent = WechatMiniprogram.CustomEvent;
import {blockLoading} from "../../modules/core/managers/LoadingManager";
import {roomMgr} from "../../modules/room/managers/RoomManager";
import {Animation} from "../../modules/room/data/IRoomDrawable";
import {MathUtils} from "../../utils/MathUtils";

type WindowType = "Start" | "Room" | "Tags";

const AccThreshold = 0.3;
const TimeRate = 200;

type RuntimeAnimation = {
  animation: Animation
  textures: Texture[]
  sprite: Sprite
}

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
    this.setupWxListeners();
    await this.refresh();
  }

  private async loadRoom() {
    // const room = Room.testData();
    const room = await roomMgr().getSelfRoom();
    await this.setItem(room);
    await roomMgr().enterRoom(room,
        e => this.onRoomMessage(e))
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
    this.updateAnimations();
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
  @blockLoading
  onRoomNameBlur(e: CustomEvent) {
    console.log("onRoomNameBlur", e);
    const name = e.detail.value;

  }

  @pageFunc
  onShopTap() { pageMgr().push(ShopPage); }

  // endregion

  // endregion

  // region 界面绘制

  private pixiObj: {
    aniTime: number
    background?: Sprite
    house?: Container
    layers: Sprite[]
    animations: RuntimeAnimation[]
  } = {
    aniTime: 0,
    layers: [],
    animations: []
  };

  public get isDebug() { return this.sys.platform == 'devtools'; }

  @onCanvasSetup
  public async refresh() {
    await this.drawBackground();
    await this.drawHouse();
    this.canvasPage.render();
    console.log("canvasPage", this.canvasPage);
  }

  private async drawBackground() {
    const skin = this.item.skin;

    const w = this.canvasPage.width;
    const h = this.canvasPage.height;
    const ctx = this.canvasPage.makeContext(w, h);

    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, `#${skin.backgroundColors[0]}`);
    grd.addColorStop(1, `#${skin.backgroundColors[1]}`);

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    const dataUrl = ctx.canvas.toDataURL();
    const bg = await this.canvasPage.createSprite(dataUrl);
    bg.x = bg.y = 0;
    bg.alpha = this.isDebug ? 0.5 : 1;

    this.canvasPage.add(bg);
    this.pixiObj.background = bg;
  }
  private async drawHouse() {
    console.log("drawHouse", this.item)

    const house = this.canvasPage.createContainer();

    house.x = this.canvasPage.width / 2;
    house.y = this.canvasPage.height / 2;

    house.width = this.canvasPage.width;
    house.height = this.canvasPage.height;

    house.scale.x = house.scale.y = 0.3;
    house.pivot.x = house.pivot.y = 0.5;

    // house.alpha = this.isDebug ? 0.5 : 1;

    const picture = await this.canvasPage
      .createSprite(this.item.pictureUrl);

    picture.anchor.x = picture.anchor.y = 0.5;
    picture.zIndex = 0;

    house.addChild(picture);

    for (const layer of this.item.layers) {
      const ls = await this.canvasPage
        .createSprite(layer.pictureUrl);
      ls.anchor.x = layer.anchor[0];
      ls.anchor.y = layer.anchor[1];
      ls.x = layer.position[0] * picture.width;
      ls.y = layer.position[1] * picture.height;
      ls.zIndex = layer.z;

      house.addChild(ls);
      this.pixiObj.layers.push(ls);
    }
    for (const animation of this.item.animations) {
      const textures = [];
      for (let i = 0; i < animation.count; i++)
        textures.push(await this.canvasPage
          .createTexture(animation.pictureUrl(i)));

      const as = await this.canvasPage.createSprite();
      as.anchor.x = animation.anchor[0];
      as.anchor.y = animation.anchor[1];
      as.x = animation.position[0] * picture.width;
      as.y = animation.position[1] * picture.height;
      as.zIndex = animation.z;
      as.alpha = 0;

      house.addChild(as);
      this.pixiObj.animations.push({
        animation, textures, sprite: as
      });
    }
    house.sortChildren();

    this.canvasPage.add(house);
    this.pixiObj.house = house;
  }

  private updateHouseMove() {
    if (!this.pixiObj.house) return;

    const runtimeFocus = this.data.runtimeFocus;
    const focusing = runtimeFocus?.isValid
    if (!focusing) { // 缩小
      const dtScale = (this.pixiObj.house.scale.x - 0.3) / 8;
      if (dtScale <= 0.00001) return;

      this.pixiObj.house.scale.x -= dtScale;
      this.pixiObj.house.scale.y -= dtScale;

    } else { // 放大
      const dtScale = (0.4 - this.pixiObj.house.scale.x) / 24;
      if (dtScale <= 0.00001) return;

      this.pixiObj.house.scale.x += dtScale;
      this.pixiObj.house.scale.y += dtScale;
    }

    this.canvasPage.render();
  }

  private updateAnimations() {
    if (this.pixiObj.animations.length <= 0) return;

    const runtimeFocus = this.data.runtimeFocus;
    const focusing = runtimeFocus?.isValid;

    this.pixiObj.aniTime += pageMgr().deltaTime;
    this.pixiObj.animations.forEach(
      ani => this.updateAnimation(ani, focusing));
  }

  private updateAnimation(ra: RuntimeAnimation, focusing) {
    const ani = ra.animation;
    const fd = ani.duration / ani.count * 1000;
    const index = Math.floor((this.pixiObj.aniTime / fd) % ani.count);

    ra.sprite.texture = ra.textures[index];
    ra.sprite.alpha = MathUtils.clamp(
      ra.sprite.alpha + (focusing ? 0.05 : -0.05));
  }

  // endregion
}
