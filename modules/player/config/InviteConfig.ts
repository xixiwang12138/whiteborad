import {BaseConfig, config} from "../../core/data/BaseConfig";
import {BaseData} from "../../core/data/BaseData";
import {DataLoader, DataOccasion, field, occasion} from "../../core/data/DataLoader";
import {Reward, RewardGroup, RewardType} from "../data/Reward";
import {cGte, ConditionGroup, ConditionType} from "../data/Condition";
import {playerMgr} from "../managers/PlayerManager";
import {PlayerTask} from "../data/PlayerTask";

class InviteData extends BaseData {

	@field(Number)
	public count: number
	@field([Reward])
	public rewards: Reward[] = []

	public static create(index: number, count: number,
											 rewardJson: Partial<Reward>[]) {
		const res = new InviteData(index);
		res.count = count;
		res.rewards = rewardJson.map(
			r => DataLoader.load(Reward, r));
		return res;
	}

	// region 额外数据

	@field(String)
	@occasion(DataOccasion.Extra)
	public rewardDescription: string
	@field(Boolean)
	@occasion(DataOccasion.Extra)
	public isClaimed: boolean

	public async refresh() {
		const group = RewardGroup.create(...this.rewards);
		this.rewardDescription = group.description("\n");

		const pt = await playerMgr().getData(PlayerTask);
		this.isClaimed = pt.inviteTask.claimedRewards.includes(this.index);

		console.log("Task", this.index, this, pt);
	}

	// endregion
}

@config("InviteConfig")
export default class InviteConfig extends BaseConfig {

	@field([InviteData])
	data: InviteData[] = [
		InviteData.create(0, 1, [{
			type: RewardType.Gold, value: 100
		}, {
			type: RewardType.Score, value: 1
		}]),
		InviteData.create(1, 3, [{
			type: RewardType.Gold, value: 300
		}, {
			type: RewardType.Score, value: 5
		}]),
		InviteData.create(2, 5, [{
			type: RewardType.Gold, value: 600
		}, {
			type: RewardType.Score, value: 10
		}]),
		InviteData.create(3, 10, [{
			type: RewardType.Gold, value: 2000
		}, {
			type: RewardType.Score, value: 25
		}]),
		InviteData.create(4, 20, [{
			type: RewardType.Gold, value: 5000
		}, {
			type: RewardType.Score, value: 75
		}]),
		// InviteData.create(50, [{
		// 	type: RewardType.Gold, value: 8000
		// }, {
		// 	type: RewardType.RoomSkin, value: 10
		// }, {
		// 	type: RewardType.Score, value: 200
		// }]),
	]

	public conditions(index) {
		return ConditionGroup.create(
			cGte(ConditionType.InviteCount, this.data[index]?.count || 99999)
		);
	}
	public rewards(index) {
		return RewardGroup.create(
			...this.data[index]?.rewards
		);
	}

}
