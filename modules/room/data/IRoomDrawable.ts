import {BaseData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";
import {RoomSkin} from "./RoomSkin";
import {NPCRoom} from "./NPCRoom";
import {Room} from "./Room";

export enum AnimationType {
	Normal, Focus
}

export interface IRoomDrawable {

	id?: number
	roomId?: string

	thumbnail?: string; // 缩略图
	picture?: string; // 背景图片
	layers: PictureLayer[]; // 额外图层
	animations: Animation[]; // 动画
}

export class PictureLayer extends BaseData {

	@field(String)
	public name?: string; // 图层名称
	@field(String)
	public picture?: string; // 图层图片
	@field
	public z: number = 0; // 图层Z坐标

	@field([Number])
	public offset: [number, number] = [0, 0]; // 图层偏移量
	@field([Number])
	public anchor: [number, number] = [0.5, 0.5]; // 锚点

	parent: IRoomDrawable

	constructor(index, parent: IRoomDrawable) {
		super(index);
		this.parent = parent;
	}

	public get isNPCRoom() { return this.parent instanceof NPCRoom }
	public get isRoomSkin() { return this.parent instanceof RoomSkin }

	public get pictureUrl() {
		const root = this.isNPCRoom ? "npcRooms" : "roomSkins";
		return this.picture || `/${root}/layers/${this.parent.id}-${this.index}.png`;
	}
}

export class Animation extends BaseData {

	@field(Number)
	public type: AnimationType = AnimationType.Normal;
	@field(Boolean)
	public isCharacter: boolean; // 是否人物动作
	// 如果是人物动作，则不能同时出现，而且会有淡入淡出效果

	@field(Number)
	public motionId?: number;  // 关联的Motion

	@field(Number)
	public count: number; // 持续帧数
	@field
	public duration: number = 1; // 单次播放时长（秒）
	@field(Number)
	public repeat?: number;  // 最少重复播放次数（如果关联了Motion，该字段无效，因为Motion播放固定时长为1分钟）
	@field(Number)
	public rate?: number; // 出现概率（如果关联了Motion，按Motion的来算）

	@field
	public z: number = 0; // Z坐标
	@field([Number])
	public offset: [number, number] = [0.5, 0.5]; // 位置（按百分比）
	@field([Number])
	public anchor: [number, number] = [0.5, 0.5]; // 锚点

	parent: IRoomDrawable

	constructor(index, parent: IRoomDrawable) {
		super(index);
		this.parent = parent;
	}

	public get isNPCRoom() { return this.parent instanceof NPCRoom }
	public get isRoomSkin() { return this.parent instanceof RoomSkin }

	public pictureUrl(index, gender = 0) {
		const root = this.isNPCRoom ? "npcRooms" : "roomSkins";
		return `/${root}/animations/${this.parent.id}-${this.index}-${index}` +
			this.isCharacter && gender > 0 ? `-${gender}.png` : `.png`
	}
}
