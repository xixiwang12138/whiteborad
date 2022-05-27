import {BaseData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";

export enum EffectType {
	None = "None"
}

class LevelSetting extends BaseData {
	@field(Number)
	public idx: number = 0;
	@field(Number)
	public value: number = 0;
	@field(String)
	public method: "add" | "mult" = "add";
}

export class Effect extends BaseData {

	@field
	public percent: number = 1; // 成功几率

	@field(String)
	public type: EffectType = EffectType.None;
	@field([Object])
	public params: any[] = [];
	@field([LevelSetting])
	public levelSettings: LevelSetting[] = [];

	/**
	 * 创建
	 */
	public static create(type: EffectType, params: any[]) {
		const res = new Effect();
		res.type = type;
		res.params = params;
		return res;
	}

	/**
	 * 应用等级效果
	 */
	public applyLevel(level) {
		const params = this.params.slice();
		this.levelSettings.forEach(ls => {
			switch (ls.method) {
				case "add": params[ls.idx] += ls.value * level; break;
				case "mult": params[ls.idx] *= ls.value * level; break;
			}
		});
		return Effect.create(this.type, params);
	}

}
