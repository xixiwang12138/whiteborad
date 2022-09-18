import {playerData} from "../managers/PlayerManager";
import {BaseData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";
import {PlayerData} from "./Player";
import {get} from "../../core/BaseAssist";
import {Cache} from "../../core/data/Cache";

export class PlayerInviteTask extends BaseData {

	@field(Number)
	public count: number = 0;
	@field([Number])
	public claimedRewards: number[] = [];

}

@playerData("PlayerTask")
export class PlayerTask extends PlayerData {

	@field(PlayerInviteTask)
	public inviteTask: PlayerInviteTask = new PlayerInviteTask();

	public invite() {
		this.inviteTask.count++;
	}
	public claim(index: number) {
		if (!this.inviteTask.claimedRewards.includes(index))
			this.inviteTask.claimedRewards.push(index);
	}
}

export class PlayerTaskCache extends Cache<PlayerTask>{

	protected syncItf = get("player/player_task/get");

}