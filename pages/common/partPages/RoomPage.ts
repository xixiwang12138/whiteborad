import { BaseData } from "../../../modules/core/data/BaseData";
import {CanvasPage, waitForCanvas} from "./CanvasPage";
import {field} from "../../../modules/core/data/DataLoader";
import {roomMgr} from "../../../modules/room/managers/RoomManager";
import {Room} from "../../../modules/room/data/Room";
import {PartialPage} from "../core/BasePage";
import {Container, Rectangle, Sprite} from "pixi.js";
import {Animation} from "../../../modules/room/data/IRoomDrawable";
import {pageMgr} from "../../../modules/core/managers/PageManager";
import {MathUtils} from "../../../utils/MathUtils";
import {Constructor} from "../../../modules/core/BaseContext";
import {appMgr} from "../../../modules/core/managers/AppManager";

const TimeRate = 100;
const AniColCount = 4;
const MotionDuration = 60;
const DefaultHouseScale = 0.6;
const FocusingHouseScale = 0.8;
const DebugAlpha = 0.33;

type RuntimeAnimation = {
	animation: Animation
	sprite: Sprite
	width: number
	height: number
}

class Data extends BaseData {

	@field(Room)
	room: Room
	@field(String)
	backgroundStyle: string;
}

export class RoomPage extends PartialPage<Data> {

	public data = new Data();

	public get room() { return this.data.room }

	public async loadSelfRoom() {
		const room = await roomMgr().getSelfRoom();
		await this.setData({room});
	}
}

export class RoomDrawingPage extends CanvasPage {

	// region 绘制数据

	private room: Room;
	private focusing: boolean = false;

	private base: {
		background?: Sprite
		house?: Container
		picture?: Sprite
		layers: Sprite[]
	} = {
		layers: []
	};

	private motion: {
		aniTime: number
		animations: RuntimeAnimation[]
		curMotionId: number
		duration: number
	} = {
		aniTime: 0,
		animations: [],
		curMotionId: 1,
		duration: 0
	};

	private position = [0.5, 0.5];
	private scale = 1;

	private get defaultScale() {
		return DefaultHouseScale * this.scale;
	}
	private get focusingScale() {
		return FocusingHouseScale * this.scale;
	}

	public clearData() {
		this.base = { layers: [] };
		this.motion = {
			aniTime: 0,
			animations: [],
			curMotionId: 1,
			duration: 0
		}
	}

	// endregion

	// region 基本绘制

	public async draw(room: Room,
										position = [0.5, 0.5],
										scale = 1) {
		this.clear();
		this.room = room;
		this.position = position;
		this.scale = scale;
		await this.waitForCanvasSetup();
		await this.drawBackground();
		await this.drawHouse();
		this.render();
	}

	private async drawBackground() {
		const ctx = this.drawBackgroundContext();
		await this.createBackgroundSprite(ctx);
	}
	private drawBackgroundContext() {
		const skin = this.room.skin;

		const w = this.width, h = this.height;
		const res = this.makeContext(w, h);

		const grd = res.createLinearGradient(0, 0, 0, h);
		grd.addColorStop(0, `#${skin.backgroundColors[0]}`);
		grd.addColorStop(1, `#${skin.backgroundColors[1]}`);

		res.fillStyle = grd;
		res.fillRect(0, 0, w, h);

		return res;
	}
	private async createBackgroundSprite(ctx) {
		const dataUrl = ctx.canvas.toDataURL();
		const bg = await this.createSprite(dataUrl);
		bg.x = bg.y = 0;
		bg.alpha = appMgr().isDebug ? DebugAlpha : 1;

		this.add(this.base.background = bg);
	}

	private async drawHouse() {
		const house = this.createHouse();
		const picture = await this.drawPicture(house);
		await this.drawLayers(house, picture);
		await this.drawAnimations(house, picture);

		house.sortChildren();
		house.alpha = appMgr().isDebug ? DebugAlpha : 1;
		this.add(house);
	}
	private createHouse() {
		const res = this.createContainer();

		res.x = this.width * this.position[0];
		res.y = this.height * this.position[1];
		res.width = this.width; res.height = this.height;

		res.scale.x = res.scale.y = this.defaultScale;
		res.pivot.x = res.pivot.y = 0.5;

		return this.base.house = res;
	}
	private async drawPicture(house) {
		const res = await this
			.createSprite(this.room.pictureUrl);

		res.anchor.x = res.anchor.y = 0.5;
		res.zIndex = 0;

		house.addChild(res);

		return res;
	}
	private async drawLayers(house, picture) {
		for (const layer of this.room.layers) {
			const ls = await this.createSprite(layer.pictureUrl);
			ls.anchor.x = layer.anchor[0];
			ls.anchor.y = layer.anchor[1];
			ls.x = layer.position[0] * picture.width;
			ls.y = layer.position[1] * picture.height;
			ls.zIndex = layer.z;

			this.base.layers.push(ls);
			house.addChild(ls);
		}
	}
	private async drawAnimations(house, picture) {
		for (const animation of this.room.animations) {
			const sprite = await this.createSprite(animation.pictureUrl());
			// const Rect = sprite.texture.frame.constructor sprite Constructor<Rectangle>;
			const row = Math.ceil(animation.count / AniColCount);
			const width = sprite.texture.width / AniColCount,
				height = sprite.texture.height / row;

			sprite.anchor.x = animation.anchor[0];
			sprite.anchor.y = animation.anchor[1];
			sprite.x = animation.position[0] * picture.width;
			sprite.y = animation.position[1] * picture.height;
			sprite.zIndex = animation.z;
			sprite.alpha = 0;

			this.motion.animations.push({
				animation, sprite, width, height
			});
			house.addChild(sprite);
		}
	}

	public clear() {
		this.remove(this.base.background);
		this.remove(this.base.house);
		this.clearData();
	}

	// endregion

	// region 修改

	// endregion

	// region 更新

	update(focusing = false) {
		this.focusing = focusing;
		this.updateHouseScale();
		this.updateMotions();
		this.updateAnimations();

		this.render();
	}

	private updateHouseScale() {
		if (!this.base.house) return;

		let dtScale = this.focusing ?
			(this.focusingScale - this.base.house.scale.x) / 24 :
			(this.defaultScale - this.base.house.scale.x) / 8;

		if (Math.abs(dtScale) <= 0.00001) return;

		this.base.house.scale.x += dtScale;
		this.base.house.scale.y += dtScale;
	}

	private updateMotions() {
		const rate = appMgr().isDebug ? TimeRate : 1;
		const dt = pageMgr().deltaTime * rate;

		this.motion.duration += dt;
		if ((this.motion.duration += dt)
			< MotionDuration * 1000) return;

		this.motion.duration = 0;
		this.motion.curMotionId = MathUtils.randomInt(1, 3);
	}

	private updateAnimations() {
		if (this.motion.animations.length <= 0) return;

		this.motion.aniTime += pageMgr().deltaTime;
		this.motion.animations.forEach(
			ani => this.updateAnimation(ani));
	}

	private updateAnimation(ra: RuntimeAnimation) {
		const show = this.focusing && (!ra.animation.motionId ||
			this.motion.curMotionId == ra.animation.motionId);

		const ani = ra.animation;
		const fd = ani.duration / ani.count * 1000;
		const index = Math.floor((this.motion.aniTime / fd) % ani.count);

		ra.sprite.alpha = MathUtils.clamp(
			ra.sprite.alpha + (show ? 0.05 : -0.05));

		const w = ra.width, h = ra.height;
		const c = index % AniColCount, r = Math.floor(index / AniColCount)
		const Rect = ra.sprite.texture.frame.constructor as Constructor<Rectangle>;
		ra.sprite.texture.frame = new Rect(c * w, r * h, w, h);
	}

	// endregion

}
