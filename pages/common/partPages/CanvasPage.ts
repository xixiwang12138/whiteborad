// @ts-ignore
import {createPIXI} from "../../../lib/pixi.miniprogram";
import {BaseData} from "../../../modules/core/data/BaseData";
import {BasePageData, PartialPage} from "../core/BasePage";
import {pageFunc} from "../PageBuilder";
import {PromiseUtils} from "../../../utils/PromiseUtils";

const unsafeEval = require("../../../lib/unsafeEval")
const installAnimate = require("../../../lib/pixi-animate")
const myTween = require("../../../lib/myTween")

import * as PIXI from 'pixi.js';
import {Container, Graphics, Sprite, Texture} from "pixi.js";
import Canvas = WechatMiniprogram.Canvas;
import {CloudFileUtils} from "../../../utils/CloudFileUtils";

const MaxCanvasSize = 1365;

export function waitForCanvas(obj, key, desc) {
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

export class CanvasPage<T extends BaseData = Data> extends PartialPage<T> {

	public data = new Data() as T;

	private selector: string;

	public canvas;
	public renderer;
	public pixi;
	public stage: Container;

	constructor(selector = "#main-canvas") {
		super();
		this.selector = selector;
	}

	@pageFunc
	async onReady(e) {
		this.setupCanvas();
	}

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

			this.canvas.getContext2 = this.canvas.getContext;
			this.canvas.getContext = function(t?) {
				const res = this.getContext2('webgl', { alpha: true });
				res.fillStyle = '';
				res.fillRect = function() {}
				res.drawImage = function() {}
				res.getImageData = function() {}
				return res;
			}
			// const context = this.canvas.getContext('webgl', { alpha: true }));
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

	// @ts-ignore
	public async createSprite(urlOrCanvas?: string | HTMLCanvasElement,
														waitFor = true): Promise<Sprite> {
		// if (typeof urlOrCanvas == "string") {
		// 	if (urlOrCanvas.startsWith("@")) // 远程文件
		// 		urlOrCanvas = await CloudFileUtils.downloadFile(urlOrCanvas.slice(1));
		//
		// 	const res: Sprite = this.pixi.Sprite.from(urlOrCanvas);
		// 	if (waitFor) await PromiseUtils.waitFor(
		// 		() => res.texture.valid);
		// 	return res;
		// } else if (urlOrCanvas)
		// 	return this.pixi.Sprite.fromCanvas(urlOrCanvas);
		// return new this.pixi.Sprite(
		// 	new this.pixi.Texture(new this.pixi.BaseTexture())
		// );
		return new this.pixi.Sprite(await this.createTexture(urlOrCanvas, waitFor));
	}

	// @ts-ignore
	public async createTexture(urlOrCanvas?: string | HTMLCanvasElement,
														 waitFor = true): Promise<Texture> {
		if (typeof urlOrCanvas == "string") {
			const oriUrl = urlOrCanvas;
			if (urlOrCanvas.startsWith("@")) // 远程文件
				urlOrCanvas = await CloudFileUtils.downloadFile(urlOrCanvas.slice(1));

			const res: Texture = this.pixi.Texture.from(urlOrCanvas);
			if (waitFor) await PromiseUtils.waitFor(() => res.valid,
				20, 1000);
			return res;
		} else if (urlOrCanvas)
			return this.pixi.Texture.fromCanvas(urlOrCanvas);
		return new this.pixi.Texture(new this.pixi.BaseTexture());
	}
	public createGraphics(): Graphics {
		return new this.pixi.Graphics();
	}

	public createContainer(): Container {
		return new this.pixi.Container();
	}

	// @ts-ignore
	public makeContext(width, height): CanvasRenderingContext2D {
		// const rate = Math.max(width, height) / MaxCanvasSize;
		// if (rate > 1) {
		// 	width = Math.floor(width / rate);
		// 	height = Math.floor(height / rate);
		// }
		// @ts-ignore
		const canvas = wx.createOffscreenCanvas({
			type: "2d", width, height
		});
		// @ts-ignore
		canvas.width = width;
		// @ts-ignore
		canvas.height = height;
		// const canvas = document.createElement('canvas');
		return canvas.getContext('2d');
		// const context = canvas.getContext('2d');

		// canvas.width = Math.max(width || 0, 1);
		// canvas.height = Math.max(height || 0, 1);

		// const baseTexture = new this.pixi.BaseTexture(canvas);
		// baseTexture.mipmap = false;
		// baseTexture.width = width;
		// baseTexture.height = height;

		// return context;
	}

	// @ts-ignore
	public setContext(sprite: Sprite, context: CanvasRenderingContext2D) {
		const width = context.canvas.width;
		const height = context.canvas.height;
		const baseTexture = this.pixi.BaseTexture.from(context.canvas, {
			width, height
		});
		console.log("baseTexture", baseTexture);
		// baseTexture.mipmap = false;

		sprite.texture = new this.pixi.Texture(baseTexture);
		sprite.texture.noFrame = false;
		sprite.texture.frame.width = width;
		sprite.texture.frame.height = height;
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
