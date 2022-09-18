import {Itf} from "../BaseAssist";
import {BaseData} from "./BaseData";
import {DataLoader, DataOccasion} from "./DataLoader";

interface Cacheable {
    get dirty(): boolean
    set dirty(boolean)
    sync()
}

export abstract class Cache<T extends BaseData> implements Cacheable {

    private _data: T;

    public get data():T { return this._data }

    protected syncItf:Itf;

    private _dirty:boolean = true; // 初始化的时候即为dirty，从而在首次访问的时候可以进行同步

    public get dirty() {return this._dirty}

    public set dirty(flag) {this._dirty = flag}

    public async sync(){
        if(this.syncItf){
            let res = await this.syncItf();
            this._data = DataLoader.load<T>(DataOccasion.Cache, res);
            this._dirty = false;
        }
    }
}