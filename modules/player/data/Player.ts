import {MainData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";

export enum PlayerState {
	Normal, Banned
}

export class Player extends MainData {

	@field
	public openid: string = "";
	@field
	public chainId: number;
	@field
	public account: string = "";
	@field
	public name: string = "";
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
	@field(Number)
	public characterId: number;
	@field(Number)
	public createTime: number;

	@field(Number)
	public gold: number;

	@field(Number)
	public state: PlayerState = PlayerState.Normal;
	@field(Number)
	public stateTime: number;
	@field(String)
	public stateDesc?: string;

}
