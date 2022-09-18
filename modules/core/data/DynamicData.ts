import {BaseData, MainData} from "./BaseData";
import {Itf} from "../BaseAssist";


export abstract class DynamicData extends MainData {

	/**
	 * 业务主键
	 */
	public get dataId(): string {
		// @ts-ignore
		return this[DataLoader.getDataPK(this.constructor)];
	}

}

interface Cacheable {
	get dirty(): boolean
	set dirty(boolean)
	sync()
}

export abstract class CacheableData extends DynamicData implements Cacheable{

	protected syncItf:Itf;

	private _dirty:boolean = true; // 初始化的时候即为dirty，从而在首次访问的时候可以进行同步

	public get dirty() {return this._dirty}

	public set dirty(flag) {this._dirty = flag}

	public async sync(){
		if(this.syncItf){
			let res = await this.syncItf();
			Object.assign(this, res);
		}
	}
}