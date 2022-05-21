// @ts-ignore
import {createPIXI} from "../../../lib/pixi.miniprogram";
import {BaseData} from "../../../modules/core/data/BaseData";
import {PartialPage} from "../core/BasePage";
import {pageFunc} from "../PageBuilder";
import {PromiseUtils} from "../../../utils/PromiseUtils";

const unsafeEval = require("../../../lib/unsafeEval")
const installAnimate = require("../../../lib/pixi-animate")
const myTween = require("../../../lib/myTween")

export function onCanvasSetup(obj, key, desc) {
	const oriFunc = desc.value;
	desc.value = async function (...p) {
		if (!this.canvasPage) return;
		await (this.canvasPage as CanvasPage).waitForCanvasSetup();
		return oriFunc.apply(this, p);
	}
}

class Data extends BaseData {

}

const CanvasWidth = 750;

export class CanvasPage extends PartialPage<Data>{

	public data = new Data();

	private selector: string;

	public canvas;
	public renderer;
	public pixi;
	public stage;

	constructor(selector = "#main-canvas") {
		super();
		this.selector = selector;
		this.setupCanvas();
	}

	// @pageFunc
	// async onLoad(e) {
	// }

	setupCanvas() {
		const info = wx.getSystemInfoSync();
		const sw = info.screenWidth; // 获取屏幕宽高
		const sh = info.screenHeight; // 获取屏幕宽高
		const tw = CanvasWidth; // canvas显示宽度
		const th = Math.round(tw * sh / sw); // 计算canvas实际高度

		const query = wx.createSelectorQuery();

		query.select(this.selector).node().exec(res => {
			this.canvas = res[0].node;
			this.canvas.width = sw;
			this.canvas.height = sh;
			this.pixi = createPIXI(this.canvas, tw);

			unsafeEval(this.pixi);
			installAnimate(this.pixi);

			this.renderer = this.pixi.autoDetectRenderer({
				width: tw, height: th, transparent: true,
				premultipliedAlpha: true, view: this.canvas
			});
			this.stage = new this.pixi.Container();
		})
	}

	public async waitForCanvasSetup() {
		return PromiseUtils.waitFor(() => !!this.canvas);
	}

	public get width() { return this.canvas.width; }
	public get height() { return this.canvas.height; }

	// region Sprite操作

	public async createSprite(url, waitFor = true) {
		const res = this.pixi.Sprite.from(url);
		if (waitFor) await PromiseUtils.waitFor(
			() => res.texture.valid);
		return res;
	}

	public createGraphics() {
		return this.pixi.Graphics();
	}

	// endregion

	// region Stage操作

	public add(obj) { this.stage.addChild(obj); }
	public remove(obj) { this.stage.removeChild(obj); }

	// endregion

	// region 渲染

	public render() {
		this.renderer.render(this.stage);
	}

	// endregion

}
