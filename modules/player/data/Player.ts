import {MainData, StateData} from "../../core/data/BaseData";
import {dataPK, field} from "../../core/data/DataLoader";
import {DynamicData} from "../../core/data/DynamicData";

const DefaultGold = 100;

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

export type PlayerBaseInfo = {
	openid: string
	chainId: string
	address: string
	name: string
	nickName: string
	avatarUrl: string
	level: string
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
	@field
	public level: number = 1;
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

	public refresh() {

	}

	// endregion

	/**
	 * 修改数据
	 */
	public edit(info: PlayerEditableInfo) {
		Object.assign(this, info);
	}
}

export abstract class PlayerData extends DynamicData implements IPlayerData {

	@field(String)
	@dataPK
	public openid: string;

}
