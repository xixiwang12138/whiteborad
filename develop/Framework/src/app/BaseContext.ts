import {Constructor} from "../utils/SingletonUtils";

export abstract class BaseContext<T> {

	public contents: {[K: string]: T} = {};

	public get list(): T[] { return Object.values(this.contents); }

	public abstract get contentName() : string;

	public create<T2 extends T>(
		clazz: Constructor<T2>) {
		console.log("[" + this.contentName + " CREATE] ", {clazz, this: this});
		return this.contents[clazz.name] = new clazz();
	}

	public instance<T2 extends T>(
		clazz: Constructor<T2> | string) : T2 {
		if (!clazz) return null;

		const res: T2 = (typeof clazz == 'string' ?
			this.contents[clazz]: this.instance(clazz.name)) as T2;

		if (!res) // 如果找不到
			console.error("[" + this.contentName + " GET MISS] ",
				{clazz, res, this: this});

		return res;
	}
}
