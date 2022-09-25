import {Itf} from "../BaseAssist";
import {BaseData} from "./BaseData";
import {DataLoader, DataOccasion} from "./DataLoader";
import {Constructor} from "../BaseContext";

interface Cacheable {
    get expire(): boolean
    set expire(boolean)
    sync()
}

export abstract class Cache<T extends BaseData> implements Cacheable {

    private _data: T;

    private readonly clazz: Constructor<T>;

    protected syncItf: Itf<any, T>;

    private _expire: boolean = true; // 初始化的时候即为expire，从而在首次访问的时候可以进行同步

    public get data(): T { return this._data }
    public get expire() {return this._expire}
    public set expire(flag) {this._expire = flag}

    public constructor(clazz: Constructor<T>) {
        this.clazz = clazz;
    }

    public async sync(){
        if (this.syncItf) {
            let res = await this.syncItf();
            this._data = DataLoader.load(DataOccasion.Interface, this.clazz, res);
            this._expire = false;
        }
    }
}
