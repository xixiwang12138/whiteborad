import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {CanvasPage, onCanvasSetup} from "../common/partPages/CanvasPage";

class Data extends BasePageData {
	isShowStartConfig:boolean
	isShowRoomConfig:boolean
	time:number
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
	async onLoad(e){
		await super.onLoad(e);
		await this.setData({
			isShowStartConfig: false,
			isShowRoomConfig: false,
			time: 60
		})
		await this.refresh();
	}

	@onCanvasSetup
	public async refresh() {
		await this.drawBackground();
		await this.drawHouse();
		this.canvasPage.render();
	}

	private async drawBackground() {
		const bg = await this.canvasPage.createGraphics();
		const w =
		bg.beginFill(0); // Color it black
		bg.drawRect(
			0, 0,
			this.canvasPage.width,
			this.canvasPage.height,
		);
		bg.endFill();
		this.canvasPage.add(bg);
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
	onClickStart(){
		this.setData({
			isShowStartConfig:!this.data.isShowStartConfig
		})
	}
	@pageFunc
	onClickRoomConfig(){
		this.setData({
			isShowRoomConfig:!this.data.isShowRoomConfig
		})
	}

	@pageFunc
	onClickHide(e){
		console.log(e)
		const targetName = e.currentTarget.dataset.windowname
		switch (targetName){
			case "start":
				this.setData({
					isShowStartConfig:!this.data.isShowStartConfig
				})
				break
			case "room":
				this.setData({
					isShowRoomConfig:!this.data.isShowRoomConfig
				})
				break
		}
	}

	@pageFunc
	onDragTime(e){
		console.log(e);
		this.setData({
			time:e.detail.value
		})
	}

}
