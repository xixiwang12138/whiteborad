import {BaseData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";

export enum TraitType {
	None = "None",
}

class LevelSetting extends BaseData {
	@field(Number)
	public idx: number = 0;
	@field(Number)
	public value: number = 0;
	@field(String)
	public method: "add" | "mult" = "add";
}

export class Trait extends BaseData {

	@field(String)
	public type: TraitType = TraitType.None;
	@field([Object])
	public params: any[] = [];
	@field([LevelSetting])
	public levelSettings: LevelSetting[] = [];

	/**
	 * 创建
	 */
	public static create(type: TraitType, params: any[]) {
		const res = new Trait();
		res.type = type;
		res.params = params;
		return res;
	}

	/**
	 * 应用等级
	 */
	public applyLevel(level) {
		const params = this.params.slice();
		this.levelSettings.forEach(ls => {
			switch (ls.method) {
				case "add": params[ls.idx] += ls.value * level; break;
				case "mult": params[ls.idx] *= ls.value * level; break;
			}
		});
		return Trait.create(this.type, params);
	}

}

export class TraitGroup {

	public traits: Trait[] = [];

	constructor(...traits: (Trait | TraitGroup)[]) {
		this.add(...traits);
	}

	public add(...traits: (Trait | TraitGroup)[]) {
		traits.forEach(t => t instanceof Trait ?
			this.traits.push(t.clone()) : this.add(...t.traits))
	}

	public filter(type: TraitType, idx?, val?) {
		return new TraitGroup(...this.traits.filter(
			t => t.type == type && (!idx || t.params[idx] == val)));
	}
	public sum(idx, default_ = 0) {
		return this.traits.reduce((res, t) =>
			res + t.params[idx], default_);
	}
	public prod(idx, default_ = 1) {
		return this.traits.reduce((res, t) =>
			res * t.params[idx], default_);
	}
}
