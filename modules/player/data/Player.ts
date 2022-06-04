import {BaseData, StateData} from "../../core/data/BaseData";
import {DataOccasion, dataPK, field, occasion} from "../../core/data/DataLoader";
import {DynamicData} from "../../core/data/DynamicData";

const DefaultGold = 100;
const ExpCalc = {
	A: 5, B: 15, C: 150
};

export type WxUserInfo = {
	nickName: string,
	avatarUrl: string
}

export enum PlayerState {
	Newer, Normal, Banned
}

export interface IPlayerData {
	openid: string;
}

export type PlayerEditableInfo = {
	name?: string
	gender?: number
	nickName?: string
	phone?: string
	avatarUrl?: string
	slogan?: string
}

export class PlayerBaseInfo extends BaseData {

	@field(String)
	public openid: string
	@field(Number)
	public chainId: number
	@field(String)
	public address: string
	@field(String)
	public name: string
	@field(String)
	public nickName: string
	@field(String)
	public avatarUrl: string
	@field(Number)
	public level: number
}

export class Player extends StateData<PlayerState> {

	@field @dataPK
	public openid: string;
	@field(Number)
	public chainId: number;
	@field
	public address: string; // 钱包地址

	@field
	public name: string = "";
	@field(Number)
	public gender: number = 0;
	@field
	public nickName: string = ""; // 微信名称
	@field(String)
	public phone: string;
	@field
	public avatarUrl: string = "";
	@field
	public slogan: string = "";
	@field
	public description: string = "";
	// @field
	// public level: number = 1;
	@field
	public exp: number = 0;

	@field(String)
	public inviteCode: string;

	@field(Number)
	public createTime: number;

	@field(Number)
	public gold: number = DefaultGold;

	@field(Number)
	public state: PlayerState = PlayerState.Newer;

	// region 额外数据

	@field(String)
	@occasion(DataOccasion.Extra)
	public levelStr: string
	@field(Number)
	@occasion(DataOccasion.Extra)
	public expRate: number

	public refreshExtra() {
		const level = this.level;
		this.levelStr = level.toString();
		this.expRate = this.curExp / this.calcNeedExp(level);
	}

	// endregion

	// region 金币控制

	/**
	 * 获得金钱
	 */
	public gainGold(val) {
		this.gold = Math.max(0, this.gold + val);
	}

	// endregion

	// region 等级控制

	public get level() {
		let res = 0, exp = this.exp;
		while ((exp -= this.calcNeedExp(++res)) > 0) {}
		return res;
	}
	public get curExp() {
		let level = 0, exp = this.exp;
		while ((exp -= this.calcNeedExp(++level)) > 0) {}
		return exp + this.calcNeedExp(level);
	}
	public get restExp() {
		let level = 0, exp = this.exp;
		while ((exp -= this.calcNeedExp(++level)) > 0) {}
		return -exp; // 剩余经验
	}

	/**
	 * 计算当前等级升级所需经验值
	 */
	public calcNeedExp(level) {
		return ExpCalc.A * level * level + ExpCalc.B * level + ExpCalc.C;
	}

	/**
	 * 获得经验
	 */
	public gainExp(val) {
		this.exp = Math.max(0, this.exp + val);
		this.refresh();
	}

	/**
	 * 刷新等级
	 */
	protected _level;
	private refreshLevel() {
		const level = this.level;
		if (level > this._level) // 下一级
			this.onLevelUp(this._level, level);
		this._level = level
	}

	/**
	 * 升级回调
	 */
	protected onLevelUp(oldLevel, newLevel) { }

	// endregion

	// region 刷新

	public refresh() {
		this.refreshLevel();
		this.refreshExtra();
	}

	// endregion

	// region 业务操作

	/**
	 * 修改数据
	 */
	public edit(info: PlayerEditableInfo) {
		Object.assign(this, info);
	}

	// endregion
}

export abstract class PlayerData extends DynamicData implements IPlayerData {

	@field(String)
	@dataPK
	public openid: string;

}
