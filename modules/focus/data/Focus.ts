import {DynamicData} from "../../core/data/DynamicData";
import {dataPK, field} from "../../core/data/DataLoader";
import {Reward} from "../../player/data/Reward";
import {MathUtils} from "../../../utils/MathUtils";

export const FocusTags = [
	"沉迷学习", "期末爆肝", "大考备战",
	"项目制作", "认真搞钱", "锻炼健身",
	"专注创作", "兴趣爱好", "快乐摸鱼"
];

export enum FocusState {
	NotStarted = -2, Started, Finished,
	Failed, Paused, Abnormal
}
export enum FocusMode {
	Normal, Flip, Bright
}

export class Focus extends DynamicData {

	@field(String) @dataPK
	public id: string
	@field(String)
	public openid: string
	@field(Number)
	public tagIdx: number = 0
	@field(String)
	public note: string
	@field(String)
	public mode: FocusMode = FocusMode.Normal
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

	public get tag() { return FocusTags[this.tagIdx]; }

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

	public start() {

	}
}
