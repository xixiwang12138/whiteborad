import {dataClass} from "../../core/managers/DataManager";
import {StaticData} from "../../core/data/StaticData";
import {BaseRepository, getRepository, repository} from "../../core/data/BaseRepository";
import {field} from "../../core/data/DataLoader";
import {Animation, IRoomDrawable, PictureLayer} from "./IRoomDrawable";
import {Condition} from "../../player/data/Condition";

export type Color = string;

@dataClass("RoomSkin")
export class RoomSkin extends StaticData implements IRoomDrawable {

	@field(String)
	public name: string;
	@field(String)
	public description: string;
	@field(String)
	public thumbnail?: string; // 缩略图（如果不提供，根据图层来绘制）

	@field(String)
	public picture?: string; // 房间图片
	@field([PictureLayer])
	public layers: PictureLayer[] = []; // 额外图层
	@field([Animation])
	public animations: Animation[]; // 动画

	@field
	public baseId: number = -1; // 改皮肤的初级皮肤ID（-1表示自己）
	@field
	public level: number = 1; // 房间皮肤等级

	@field([Number])
	public params: number[] = [0, 0];

	@field(String)
	public background?: string; // 房间背景
	@field([String])
	public backgroundColors: [Color, Color] = ["FFFFFF", "000000"]; // 房间背景颜色（渐变）

	@field([Condition])
	public conditions: Condition[]; // 解锁条件

	@field(Number)
	public price: number;

	public get thumbnailUrl() {
		return this.thumbnail || `/roomSkins/thumbnails/${this.id}.png` || this.pictureUrl;
	}
	public get pictureUrl() {
		return this.picture || `/roomSkins/pictures/${this.id}.png`;
	}

}

export function roomSkinRepo() {
	return getRepository(RoomSkinRepo);
}

@repository
class RoomSkinRepo extends BaseRepository<RoomSkin> {
	get clazz() {
		return RoomSkin;
	}
}
