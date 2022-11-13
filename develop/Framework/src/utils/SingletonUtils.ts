
export type Constructor<T = any> =
	(new (...args: any[]) => T) & {create?(...p): T};

class SingletonUtils {

	static singletons = {}

	public static instance<T>(clazz: Constructor<T> | string) : T {
		if (!clazz) return null;

		const res = typeof clazz == 'string' ?
			this.singletons[clazz] : this.instance(clazz.name);

		if (!res) console.error("[Singleton GET MISS] ", {clazz, res, this: this});

		return res;

		// if (typeof clazz == 'string')
		// 	return this.singletons[clazz];
		// return this.instance(clazz.name);
	}

	public static add<T>(clazz: Constructor<T>, value: T) {
		this.singletons[clazz.name] = value;

		console.log("[Singleton ADD] ", {clazz, this: this});
	}
	public static remove<T>(clazz: Constructor<T>) {
		this.singletons[clazz.name] = null;

		console.log("[Singleton REMOVE] ", {clazz, this: this});
	}
}

export function singleton<T>(clazz: Constructor<T>) {
	SingletonUtils.add(clazz, new clazz());
}

export function getSingleton<T>(clazz: Constructor<T>) {
	return SingletonUtils.instance(clazz);
}
