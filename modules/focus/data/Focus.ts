import {DynamicData} from "../../core/data/DynamicData";
import {DataOccasion, dataPK, field, occasion} from "../../core/data/DataLoader";
import {MathUtils} from "../../../utils/MathUtils";
import {r, Reward, RewardGroup, RewardType} from "../../player/data/Reward";
import {BaseData} from "../../core/data/BaseData";
import {DateUtils} from "../../../utils/DateUtils";
import {playerMgr} from "../../player/managers/PlayerManager";
import {Room} from "../../room/data/Room";
import {NPCRoom} from "../../room/data/NPCRoom";
import {roomMgr} from "../../room/managers/RoomManager";
import {IRoomIndex} from "../../room/data/PlayerRoom";

export const FocusTags = [
	"沉迷学习", "期末爆肝", "大考备战",
	"项目制作", "认真搞钱", "锻炼健身",
	"专注创作", "兴趣爱好", "快乐摸鱼"
];

export enum FocusState {
	NotStarted = -2, Started,
	Finished, Failed, Abnormal
}
export enum FocusMode {
	Normal, Flip, Bright
}

const MaxInvalidTime = 15;
const OverdueTime = 60 * 60 * 1000; // 过期时间（60分钟）
const AbnormalTime = 60 * 1000; // 60秒内的专注不算入内
const DefaultDuration = 60;

const GoldRewardCalc = {
	MaxG: 300, MaxD: 210, K: 0.1, MinK: 0.5
}
const ExpRewardCalc = {
	K: 10
}

export class RuntimeFocus extends BaseData {

	@field
	public elapseTime: number = 0;
	@field
	public realTime: number = 0;

	@field
	public isDown: boolean = false; // 朝下
	@field
	public invalidTime: number = 0; // 单次无效的时间
	@field
	public invalidCount: number = 0; // 中途无效次数

	public focus: Focus

	constructor(index?, parent?) {
		super(index);
		if (parent && parent instanceof Focus)
			this.focus = parent;
	}

	// region 拓展数据

	@field
	@occasion(DataOccasion.Extra)
	public restTime: string;
	@field
	@occasion(DataOccasion.Extra)
	public restInvalidTime: string;

	public refresh() {
		if (!this.focus) return;

		const duration = this.focus.duration;
		const rest = duration * 60 - this.elapseTime / 1000;
		this.restTime = DateUtils.sec2Str(rest);

		const restI = MaxInvalidTime - this.invalidTime / 1000;
		this.restInvalidTime = Math.floor(restI).toString();
	}

	// endregion

	public static create(focus: Focus) {
		return new RuntimeFocus(undefined, focus);
	}

	// region 状态判断

	public get isValid() {
		// if (this.isPause) return false;
		switch (this.focus.mode) {
			case FocusMode.Normal: return true;
			case FocusMode.Flip: return this.isDown;
			case FocusMode.Bright: return true; // TODO: 可能要修改
		}
	}

	public get isFailed() {
		return this.invalidTime >= MaxInvalidTime * 1000;
	}
	public get isSuccess() {
		return this.elapseTime / 1000 >= this.focus.duration * 60;
	}

	// endregion

}

export class Focus extends DynamicData {

	@field(String) @dataPK
	public id: string
	@field(String)
	public openid: string

	@field(String)
	public roomId?: string
	@field(Number)
	public npcRoomId?: number

	@field(Number)
	public tagIdx: number = 0
	@field(String)
	public note: string
	@field
	public mode: FocusMode = FocusMode.Flip
	@field(Number)
	public duration: number
	@field(Number)
	public startTime: number
	@field(Number)
	public endTime?: number
	@field([Reward])
	public rewards: Reward[];
	@field(Number)
	public state: FocusState = FocusState.NotStarted

	@field(RuntimeFocus)
	public runtime: RuntimeFocus

	public get tag() { return FocusTags[this.tagIdx]; }
	@field(Number)
	@occasion(DataOccasion.Extra)
	public get realDuration() {
		return Math.floor(this.runtime?.elapseTime / 1000 / 60);
	}

	// region 拓展数据

	@field(Number)
	@occasion(DataOccasion.Extra)
	public expectExpReward: number;
	@field(Number)
	@occasion(DataOccasion.Extra)
	public expectGoldReward: number;
	@field(Number)
	@occasion(DataOccasion.Extra)
	public expReward: number;
	@field(Number)
	@occasion(DataOccasion.Extra)
	public goldReward: number;

	public async refresh() {
		const group = await this.realRewards(this.duration);

		this.expectExpReward = group.exp.realValue;
		this.expectGoldReward = group.gold.realValue;

		if (this.rewards) {
			this.expReward = group.exp.realValue;
			this.goldReward = group.gold.realValue;
		}
	}

	// endregion

	public static testData() {
		const res = new Focus();
		res.startTime = Date.now();
		res.tagIdx = MathUtils.randomInt(0, 9);
		res.mode = MathUtils.randomInt(0, 3);
		res.duration = MathUtils.randomInt(15, 120, true);
		res.generateId();
		return res;
	}
	public static emptyData(openid: string, room: IRoomIndex) {
		const res = new Focus();
		res.openid = openid;
		res.duration = DefaultDuration;
		res.roomId = room.roomId;
		res.npcRoomId = room.npcRoomId;
		res.generateId();

		return res;
	}

	public generateId() {
		this.id = Date.now() + MathUtils.randomString(8);
	}

	// region 状态判断

	public get isEnd() {
		return this.state == FocusState.Finished ||
			this.state == FocusState.Failed;
	}
	public get isAbnormal() {
		return !this.runtime || this.state == FocusState.Abnormal ||
			(this.isEnd && this.runtime.elapseTime <= AbnormalTime);
	}

	// endregion

	// region 房间相关

	private _room: Room | NPCRoom;
	public async room() {
		if (!this._room) {
			this._room = await roomMgr().getRoom(this);
		}
		return this._room;
	}
	public inNPCRoom() {
		return !this.roomId && this.npcRoomId
	}
	public async inSelfRoom() {
		if (this.inNPCRoom()) return false;
		const room = await this.room() as Room;
		return room.openid == this.openid;
	}
	public async inOtherRoom() {
		if (this.inNPCRoom()) return false;
		const room = await this.room() as Room;
		return room.openid != this.openid;
	}

	// endregion

	// region 奖励控制

	/**
	 * 奖励
	 */
	public baseRewards(duration?) {
		return RewardGroup.create(
			r(RewardType.Gold, this.baseGoldReward(duration)),
			r(RewardType.Exp, this.baseExpReward(duration)))
	}
	private baseGoldReward(duration?) {
		const d = duration || this.realDuration, f = GoldRewardCalc;
		return Math.round(Math.max(d * f.MinK,
			f.MaxG * MathUtils.sigmoid((d / f.MaxD - 0.5) / f.K)))
	}
	private baseExpReward(duration?) {
		return (duration || this.realDuration) * ExpRewardCalc.K;
	}

	/**
	 * 奖励
	 */
	public async realRewards(duration?, openid?) {
		if (this.rewards?.length > 0)
			return RewardGroup.create(...this.rewards);

		openid ||= this.openid;
		const res = this.baseRewards(duration);
		const room = await this.room();

		let gb = room.gb, eb = room.eb;

		if (room instanceof Room) { // 如果是玩家房间
			if (room.openid != openid) { // 如果在其他人房间里专注
				res.bonus(RewardType.Gold, gb * (1 - room.feeRate));
				res.bonus(RewardType.Exp, eb);
			} else if (this.openid == openid) { // 如果专注者是自己，在自己房间里专注
				res.bonus(RewardType.Gold, gb);
				res.bonus(RewardType.Exp, eb);
			} else { // 专注者不是自己，其他人在自己房间专注
				res.bonus(RewardType.Gold, gb * room.feeRate - 1);
				res.exp.value = 0;
			}
		} else {
			res.bonus(RewardType.Gold, gb);
			res.bonus(RewardType.Exp, eb);
		}

		return res
	}

	// endregion

	// // region 流程控制
	//
	// public start() {
	// 	this.startTime = Date.now();
	// 	this.state = FocusState.Started;
	// }
	// public end() {
	// 	this.endTime = Date.now();
	// 	this.state = FocusState.Finished;
	// }
	// public cancel() {
	// 	this.endTime = Date.now();
	// 	this.state = FocusState.Failed;
	// }
	//
	// // endregion
}
