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
import SystemInfo = WechatMiniprogram.SystemInfo;
import {pageFunc} from "../PageBuilder";
import {appMgr} from "../../../modules/core/managers/AppManager";

const TimeRate = 100;
const AniColCount = 4;
const MotionDuration = 60;

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

	private motionData = {
		motionId: 1,
		duration: 0
	};

	// endregion

	public async draw(room: Room) {
		this.room = room;
		await this.waitForCanvasSetup();
		await this.drawBackground();
		await this.drawHouse();
		this.render();
	}

	private async drawBackground() {
		const skin = this.room.skin;

		const w = this.width, h = this.height;
		const ctx = this.makeContext(w, h);

		const grd = ctx.createLinearGradient(0, 0, 0, h);
		grd.addColorStop(0, `#${skin.backgroundColors[0]}`);
		grd.addColorStop(1, `#${skin.backgroundColors[1]}`);

		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, w, h);

		const dataUrl = ctx.canvas.toDataURL();
		const bg = await this.createSprite(dataUrl);
		bg.x = bg.y = 0;
		bg.alpha = appMgr().isDebug ? 0.5 : 1;

		this.add(bg);
		this.pixiObj.background = bg;
	}
	private async drawHouse() {
		console.log("drawHouse", this.room)

		const house = this.createContainer();

		house.x = this.width / 2;
		house.y = this.height / 2;

		house.width = this.width;
		house.height = this.height;

		house.scale.x = house.scale.y = 0.3;
		house.pivot.x = house.pivot.y = 0.5;

		const picture = await this
			.createSprite(this.room.pictureUrl);

		picture.anchor.x = picture.anchor.y = 0.5;
		picture.zIndex = 0;

		house.addChild(picture);

		for (const layer of this.room.layers) {
			const ls = await this
				.createSprite(layer.pictureUrl);
			ls.anchor.x = layer.anchor[0];
			ls.anchor.y = layer.anchor[1];
			ls.x = layer.position[0] * picture.width;
			ls.y = layer.position[1] * picture.height;
			ls.zIndex = layer.z;

			house.addChild(ls);
			this.pixiObj.layers.push(ls);
		}
		for (const animation of this.room.animations) {
			const as = await this
				.createSprite(animation.pictureUrl());
			// const Rect = as.texture.frame.constructor as Constructor<Rectangle>;
			const row = Math.ceil(animation.count / AniColCount);
			const width = as.texture.width / AniColCount,
				height = as.texture.height / row;

			// as.texture.frame = new Rect(0, 0, width, height);

			as.anchor.x = animation.anchor[0];
			as.anchor.y = animation.anchor[1];
			as.x = animation.position[0] * picture.width;
			as.y = animation.position[1] * picture.height;
			as.zIndex = animation.z;
			as.alpha = 0;

			house.addChild(as);
			this.pixiObj.animations.push({
				animation, sprite: as, width, height
			});
		}
		house.sortChildren();

		house.alpha = appMgr().isDebug ? 0.5 : 1;

		this.add(house);
		this.pixiObj.house = house;
	}

	update(focusing) {
		this.focusing = focusing;
		this.updateHouseMove();
		this.updateMotions();
		this.updateAnimations();
	}

	private updateHouseMove() {
		if (!this.pixiObj.house) return;

		if (!this.focusing) { // 缩小
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

		this.render();
	}

	private updateMotions() {
		const rate = appMgr().isDebug ? TimeRate : 1;
		const dt = pageMgr().deltaTime * rate;

		this.motionData.duration += dt;
		if ((this.motionData.duration += dt)
			< MotionDuration * 1000) return;

		this.motionData.duration = 0;
		this.motionData.motionId = MathUtils.randomInt(1, 3);
	}

	private updateAnimations() {
		if (this.pixiObj.animations.length <= 0) return;

		this.pixiObj.aniTime += pageMgr().deltaTime;
		this.pixiObj.animations.forEach(
			ani => this.updateAnimation(ani));

		this.render();
	}

	private updateAnimation(ra: RuntimeAnimation) {
		let show = this.focusing;
		if (ra.animation.motionId)
			show &&= this.motionData.motionId == ra.animation.motionId;

		const ani = ra.animation;
		const fd = ani.duration / ani.count * 1000;
		const index = Math.floor((this.pixiObj.aniTime / fd) % ani.count);

		ra.sprite.alpha = MathUtils.clamp(
			ra.sprite.alpha + (show ? 0.05 : -0.05));

		const w = ra.width, h = ra.height;
		const c = index % AniColCount, r = Math.floor(index / AniColCount)
		const Rect = ra.sprite.texture.frame.constructor as Constructor<Rectangle>;
		ra.sprite.texture.frame = new Rect(c * w, r * h, w, h);
	}

}
