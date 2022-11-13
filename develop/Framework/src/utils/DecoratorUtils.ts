
export function cache(obj, key, desc) {
	const oriFun = desc.value;
	desc.value = function (): Promise<any> | any {
		if (this[key + "_CACHE"]) return this[key + "_CACHE"];

		const res = oriFun.apply(this);
		// 如果是Promise需要进行特殊处理，保证非Promise时候是同步状态
		if (res instanceof Promise)
			return res.then(r => this[key + "_CACHE"] = r)
		return this[key + "_CACHE"] = res;
	}
}
