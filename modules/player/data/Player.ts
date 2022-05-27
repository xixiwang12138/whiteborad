import {MainData, StateData} from "../../core/data/BaseData";
import {dataPK, field} from "../../core/data/DataLoader";
import {DynamicData} from "../../core/data/DynamicData";

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

export abstract class PlayerData extends DynamicData implements IPlayerData {

	@field(String)
	@dataPK
	public openid: string;

}

export class Player extends StateData<PlayerState> {

	@field @dataPK
	public openid: string;
	@field(Number)
	public chainId: number;
	@field
	public account: string = "";
	@field
	public name: string = "";
	@field(Number)
	public gender: number;
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
	public gold: number;

	@field(Number)
	public state: PlayerState = PlayerState.Newer;

}
