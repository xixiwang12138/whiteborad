import {BaseData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";
import {PlayerData} from "../../player/data/Player";
import {playerData} from "../../player/managers/PlayerManager";
import {get, Itf} from "../../core/BaseAssist";

export interface IRoomIndex {

	roomId?: string
	npcRoomId?: number

}

export class SkinBuyRecord extends BaseData {

	@field(Number)
	public skinId: number;
	@field(Number)
	public buyTime: number;
	// @field(Number)
	// public price: number;

	public static create(skinId: number) {
		const res = new SkinBuyRecord();
		res.skinId = skinId;
		res.buyTime = Date.now();

		return res;
	}
}

export class RoomCollectRecord extends BaseData {

	@field(String)
	public roomId?: string;
	@field(Number)
	public npcRoomId?: number;
	@field
	public collected: boolean = true;
	@field(Number)
	public changeTime: number;

	public static create(room: IRoomIndex) {
		const res = new RoomCollectRecord();
		res.roomId = room.roomId;
		res.npcRoomId = room.npcRoomId;
		res.changeTime = Date.now();

		return res;
	}
}

export class RoomVisitRecord extends BaseData {

	@field(String)
	public roomId?: string;
	@field(Number)
	public npcRoomId?: number;
	@field(Number)
	public enterTime: number;
	@field(Number)
	public leaveTime?: number;

	public static create(room: IRoomIndex) {
		const res = new RoomVisitRecord();
		res.roomId = room.roomId;
		res.npcRoomId = room.npcRoomId;
		res.enterTime = Date.now();

		return res;
	}

	public leave() {
		this.leaveTime = Date.now();
	}
}

@playerData("PlayerRoom")
export class PlayerRoom extends PlayerData {

	@field([SkinBuyRecord])
	public buyRecords: SkinBuyRecord[] = []
	@field([RoomCollectRecord])
	public collectRecords: RoomCollectRecord[] = []
	@field([RoomVisitRecord])
	public visitRecords: RoomVisitRecord[] = []

	protected syncItf = get("room/player_room/get");

	/**
	 * 当前进入的房间
	 */
	public get visitingRoom(): IRoomIndex {
		return this.visitRecords.find(vr => !vr.leaveTime);
	}

	/**
	 * 已购买的皮肤ID列表
	 */
	public get boughtSkinIds() {
		return this.buyRecords.map(br => br.skinId);
	}

	/**
	 * 购买
	 * @param skinId
	 */
	public buy(skinId) {
		const br = this.getBuy(skinId);
		if (br) return // 已经购买
		this.buyRecords.push(SkinBuyRecord.create(skinId))
	}
	public getBuy(skinId) {
		return this.buyRecords.find(br => br.skinId == skinId);
	}

	/**
	 * 设置收藏
	 */
	public collect(room: IRoomIndex | string | number, collected = true) {
		this.getCollect(room, true).collected = collected;
	}
	public getCollect(room: IRoomIndex | string | number, create = false) {
		if (typeof room == "string") room = {roomId: room};
		if (typeof room == "number") room = {npcRoomId: room};

		let res = this.collectRecords.find(cr => // @ts-ignore
			cr.roomId == room.roomId && cr.npcRoomId == room.npcRoomId);

		if (!res && create) {
			res = RoomCollectRecord.create(room)
			this.collectRecords.push(res);
		}
		return res;
	}

	/**
	 * 访问
	 * @param room
	 */
	public enter(room: IRoomIndex | string | number) {
		this.getVisit(room, true);
	}

	/**
	 * 离开
	 * @param room
	 */
	public leave(room: IRoomIndex | string | number) {
		this.getVisit(room)?.leave();
	}

	public getVisit(room: IRoomIndex | string | number, create = false) {
		if (typeof room == "string") room = {roomId: room};
		if (typeof room == "number") room = {npcRoomId: room};

		let res = this.visitRecords.find(cr => // @ts-ignore
			cr.roomId == room.roomId && cr.npcRoomId == room.npcRoomId);

		if (!res && create) {
			res = RoomVisitRecord.create(room)
			this.visitRecords.push(res);
		}
		return res;
	}


}
