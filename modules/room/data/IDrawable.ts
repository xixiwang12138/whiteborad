import {BaseData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";
import {FurnitureSetting, RoomSkin} from "./RoomSkin";
import {NPCRoom} from "./NPCRoom";
import {Room} from "./Room";
import {motionRepo} from "./Motion";

export enum AnimationType {
	Normal, Focus
}

export interface IDrawable {

	id?: number
	roomId?: string

	thumbnail?: string; // 缩略图

	furnitureSetting?: FurnitureSetting[];

	picture?: string; // 背景图片
	layers?: PictureLayer[]; // 额外图层
	animations?: Animation[]; // 动画

	get rootPath(): string
}

export class PictureLayer extends BaseData {

	@field(String)
	public name?: string; // 图层名称
	@field(String)
	public picture?: string; // 图层图片
	@field
	public z: number = 0; // 图层Z坐标

	@field([Number])
	public position: [number, number] = [0, 0]; // 图层偏移量
	@field([Number])
	public anchor: [number, number] = [0.5, 0.5]; // 锚点

	public parent: IDrawable;

	constructor(index, parent: IDrawable) {
		super(index);
		if (parent) this.parent = parent;
	}

	public get pictureUrl() {
		return this.picture || `@/${this.parent.rootPath}/layers/${this.parent.id}-${this.index}.png`;
	}
}

export class Animation extends BaseData {

	@field(String)
	public name?: string; // 动画名称
	@field
	public type: AnimationType = AnimationType.Focus;
	@field
	public isCharacter: boolean = true; // 是否人物动作
	// 如果是人物动作，则不能同时出现，而且会有淡入淡出效果

	@field(Number)
	public motionId?: number; // 关联的Motion
	@field(Boolean)
	public custom: boolean = false; // 是否自定义动画

	@field(Number)
	public count?: number; // 持续帧数（custom下起效）
	@field
	public duration?: number = 1; // 单次播放时长（秒）（custom下起效）
	@field(Number)
	public repeat?: number;  // 最少重复播放次数（如果关联了Motion，该字段无效，因为Motion播放固定时长为1分钟）
	@field(Number)
	public rate?: number; // 出现概率（如果关联了Motion，按Motion的来算）

	@field
	public z: number = 0; // Z坐标
	@field([Number])
	public position: [number, number] = [0.5, 0.5]; // 位置（按百分比，原点为图像中心）
	@field([Number])
	public anchor: [number, number] = [0.5, 0.5]; // 锚点

	public parent: IDrawable;

	constructor(index, parent: IDrawable) {
		super(index);
		if (parent) this.parent = parent;
	}

	public get motion() { return motionRepo().getById(this.motionId); }

	public get realRate() { return this.motion?.rate || this.rate; }

	public getCount() {
		return this.custom ? this.count || this.motion.count : this.motion.count;
	}
	public getDuration() {
		return this.custom ? this.duration || this.motion.duration: this.motion.duration;
	}

	public pictureUrl(gender = 0) {
		return this.custom ? `@/${this.parent.rootPath}/animations/${this.parent.id}-${this.index}` +
			(this.isCharacter && gender > 0 ? `-${gender}.png` : `.png`) : this.motion.pictureUrl(gender);
	}

}
