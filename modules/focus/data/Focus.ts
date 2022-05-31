import {DynamicData} from "../../core/data/DynamicData";
import {DataOccasion, dataPK, field, occasion} from "../../core/data/DataLoader";
import {MathUtils} from "../../../utils/MathUtils";
import {Reward} from "../../player/data/Reward";
import {BaseData} from "../../core/data/BaseData";
import {DateUtils} from "../../../utils/DateUtils";

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

export class RuntimeFocus extends BaseData {

	@field
	public elapseTime: number = 0;
	@field
	public realTime: number = 0;

	// @field
	// public isPause: boolean = false;
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
	@field(Number)
	public mode: FocusMode = FocusMode.Flip
	@field(Number)
	public duration: number = 60
	@field(Number)
	public startTime: number
	@field(Number)
	public endTime?: number
	@field([Reward])
	public reward: Reward[] = []
	@field(Number)
	public state: FocusState = FocusState.NotStarted

	@field(RuntimeFocus)
	public runtime: RuntimeFocus

	public get tag() { return FocusTags[this.tagIdx]; }
	public get realDuration() {
		return Math.floor(this.runtime?.elapseTime / 1000 / 60);
	}

	// region 拓展数据

	@field(Number)
	@occasion(DataOccasion.Extra)
	public expectExpGain: number;
	@field(Number)
	@occasion(DataOccasion.Extra)
	public expectGoldGain: number;

	public refresh() {
		// TODO: 确定增益算法
		this.expectExpGain = this.duration * 10;
		this.expectGoldGain = this.duration * 2;
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
	public static emptyData(openid) {
		const res = new Focus();
		res.openid = openid;
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
