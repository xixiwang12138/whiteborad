import {Reward, RewardType} from "../data/Reward";
import {Constructor} from "../../core/BaseContext";
import {playerMgr} from "../managers/PlayerManager";
import {cFun, ConditionGroup} from "../data/Condition";
import {error} from "../../core/BaseAssist";

export function rewardProcessor(type: RewardType) {
	return (clazz) => {
		RewardProcessor.processorSettings[type] = clazz;
	}
}

export function createProcessor(reward: Reward) {
	const clazz = RewardProcessor.processorSettings[reward.type];
	return new clazz(reward);
}

export abstract class RewardProcessor {

	public static processorSettings:
		{ [K: string]: Constructor<RewardProcessor> } = {};

	public reward: Reward;

	protected constructor(reward: Reward) {
		this.reward = reward;
	}

	public get value() { return this.reward.value; }

	/**
	 * 预处理
	 */
	protected preprocess() { }

	/**
	 * 奖励描述
	 */
	public get description(): string { return null }

	/**
	 * 附带条件
	 */
	protected conditions(): ConditionGroup { return null; };

	/**
	 * 消耗
	 */
	public check() {
		this.preprocess();
		this.conditions()?.process();
	}

	public abstract invoke(rate?);
}

abstract class PlayerRewardProcessor extends RewardProcessor {

	public get player() { return playerMgr().player };

}

@rewardProcessor(RewardType.Gold)
class GoldRewardProcessor extends PlayerRewardProcessor {

	public get description() { return `金币 ${this.value}`; }

	public invoke(rate?) { this.player.gainGold(this.value); }
}

@rewardProcessor(RewardType.Exp)
class ExpRewardProcessor extends PlayerRewardProcessor {

	public get description() { return `经验 ${this.value}`; }

	public invoke(rate?) { this.player.gainExp(this.value); }
}

const SkinAlreadyUnlock = error(200006, "你已拥有该皮肤")

@rewardProcessor(RewardType.RoomSkin)
class RoomSkinRewardProcessor extends RewardProcessor {

	public playerRoom: PlayerRoom;

	protected async preprocess() {
		this.playerRoom = await playerMgr().getData(PlayerRoom);
	}

	private get skin() { return roomSkinRepo().getById(this.value) }
	public get description() { return `${this.skin.name} 等级${this.skin.level}`; }

	protected conditions(): ConditionGroup {
		return ConditionGroup.create(cFun(
			() => !this.playerRoom.getBuy(this.value),
			SkinAlreadyUnlock)
		);
	}

	invoke(rate?) {
		this.playerRoom.buy(this.value);
	}
}

@rewardProcessor(RewardType.Score)
class ScoreRewardProcessor extends PlayerRewardProcessor {

	// public get description() { return `积分：${this.value}`; }

	invoke(rate?) {
		this.player.gainScore(this.value);
	}
}

import {PlayerRoom} from "../../room/data/PlayerRoom";
import {roomSkinRepo} from "../../room/data/RoomSkin";
