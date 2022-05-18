import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
// @ts-ignore
import {createPIXI} from "../../lib/pixi.miniprogram";

const unsafeEval = require("../../lib/unsafeEval")
const installAnimate = require("../../lib/pixi-animate")
const myTween = require("../../lib/myTween")

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

	@pageFunc
	async onLoad(e){
		await super.onLoad(e);

		this.drawCanvas();

		await this.setData({
			isShowStartConfig:false,
			isShowRoomConfig:false,
			time:60
		})
	}

	drawCanvas() {
		const info = wx.getSystemInfoSync();
		const sw = info.screenWidth;// 获取屏幕宽高
		const sh = info.screenHeight;// 获取屏幕宽高
		const tw = 750;
		const th = Math.round(tw * sh / sw); // 计算canvas实际高度
		const stageWidth = tw;
		const stageHeight = th;
		const query = wx.createSelectorQuery();

		query.select("#main-canvas").node().exec(res => {
			console.log("query", res);
			const canvas = res[0].node;
			canvas.width = sw;
			canvas.height = sh;
			const pixi = createPIXI(canvas, stageWidth);
			unsafeEval(pixi);
			installAnimate(pixi);

			const renderer = pixi.autoDetectRenderer({
				width: stageWidth, height: stageHeight,
				transparent: true, premultipliedAlpha: true,
				view: canvas
			});
			const stage = new pixi.Container();
			const main = pixi.Sprite.from("../../assets/common/3.png");

			main.y = stageHeight * 0.5;
			main.x = stageWidth * 0.5;
			main.scale.x = main.scale.y = 1;
			main.anchor.x = 0.5;
			main.anchor.y = 0.75;

			stage.addChild(main);

			setTimeout(() => {
				renderer.render(stage);
			}, 1000);

		})
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
