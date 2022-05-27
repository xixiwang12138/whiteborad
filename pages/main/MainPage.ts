import { page, pageFunc } from "../common/PageBuilder";
import { BasePage, BasePageData } from "../common/core/BasePage";
import { playerMgr } from "../../modules/player/managers/PlayerManager";
import { PlayerPage } from "../common/partPages/PlayerPage";
import { CanvasPage, onCanvasSetup } from "../common/partPages/CanvasPage";

class Data extends BasePageData {
  isShowStartConfig: boolean
  isShowRoomConfig: boolean
  isShowSelectorConfig: boolean
  time: number
  selectorList: string[]
}

@page("main", "主页")
export class MainPage extends BasePage<Data> {

  public data = new Data();

  /**
   * 部分页
   */
  public playerPage: PlayerPage = new PlayerPage();
  public canvasPage: CanvasPage = new CanvasPage();

  @pageFunc
  async onLoad(e) {
    await super.onLoad(e);
    this.setData({
      isShowStartConfig: false,
      isShowRoomConfig: false,
      isShowSelectorConfig: false,
      time: 60,
        selectorList: ["沉迷学习", "爆肝", "大考备战", "项目制作", "认真搞钱", "锻炼健身", "专注创作", "兴趣爱好", "快乐摸鱼"]

    });
    await this.refresh();
  }

  @onCanvasSetup
  public async refresh() {
    await this.drawBackground();
    await this.drawHouse();
    this.canvasPage.render();
    console.log("canvasPage", this.canvasPage);
  }

  private async drawBackground() {
    // const bg = this.canvasPage.createGraphics();
    //
    // bg.lineStyle(4, 0xFF3300, 1);
    // bg.beginFill(0x66CCFF);
    // bg.drawRect(0, 0, 64, 64);
    // bg.endFill();
    // bg.x = 170;
    // bg.y = 170;

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

    this.canvasPage.add(bg);

    // const bg = await this.canvasPage.createGraphics();
    // const w =
    // bg.beginFill(0); // Color it black
    // bg.drawRect(
    // 	0, 0,
    // 	this.canvasPage.width,
    // 	this.canvasPage.height,
    // );
    // bg.endFill();
    // this.canvasPage.add(bg);
  }
  private async drawHouse() {
    const sp = await this.canvasPage.createSprite("../../assets/common/3.png");

    sp.x = this.canvasPage.width / 2;
    sp.y = this.canvasPage.height / 2;

    sp.scale.x = sp.scale.y = 0.8;
    sp.anchor.x = 0.5;
    sp.anchor.y = 0.75;

    this.canvasPage.add(sp);
  }

  @pageFunc
  onClickStart() {
    // this.refresh();
    this.setData({
      isShowStartConfig: !this.data.isShowStartConfig
    })
  }
  @pageFunc
  onClickRoomConfig() {
    this.setData({
      isShowRoomConfig: !this.data.isShowRoomConfig
    })
  }
  @pageFunc
  onClickSelector() {
    this.setData({
      isShowSelectorConfig: !this.data.isShowSelectorConfig
    })
  }

  @pageFunc
  onClickHide(e) {
    console.log(e)
    const targetName = e.currentTarget.dataset.windowname
    switch (targetName) {
      case "start":
        this.setData({
          isShowStartConfig: !this.data.isShowStartConfig
        })
        break
      case "room":
        this.setData({
          isShowRoomConfig: !this.data.isShowRoomConfig
        })
        break
      case "selector":
        this.setData({
          isShowSelectorConfig: !this.data.isShowSelectorConfig
        })
        break
    }
  }

  @pageFunc
  onDragTime(e) {
    console.log(e);
    this.setData({
      time: e.detail.value
    })
  }

}
