

export class BaseManager {
    public cacheManager: CacheManager;
    constructor() {
        this.cacheManager = new CacheManager();
    }
}




class CacheManager {
    public cache: {[G: string]: {[K: string]: any}} = {};
    public setFunc: <T>(group: string, key: string, val: T) => Promise<T>;
    public getFunc: <T>(group: string, key: string) => Promise<T>;
    public deleteFunc: (group: string, key: string) => Promise<any>;

    public async set(group: string, key: string, val: any) {
        if (this.setFunc)
            return this.setFunc(group, key, val);
        this.cache[group] ||= {};
        return this.cache[group][key] = val;
    }
    public async get(group: string, key: string) {
        return await this.getFunc?.(group, key) || this.cache[group]?.[key];
    }
    public async delete(group: string, key: string) {
        if (this.deleteFunc) return this.delete(group, key);
        delete this.cache[group]?.[key];
    }

    public async getByFieldValues(group: string, fieldName: string){
        const res: any[] = [];
        const groupData = this.cache[group];
        const allKeys = Object.keys(groupData);
        for (const key of allKeys) {
            const groupDatum = groupData[key];
            if(eval("groupDatum."+fieldName) !== undefined || eval("groupDatum."+fieldName) !== null){
                res.push(eval("groupDatum."+fieldName) );
            }
        }
        return res;
    }

    public async getAll(group: string) {
        return this.cache[group];
    }

}
