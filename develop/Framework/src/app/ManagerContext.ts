import {Constructor} from "../utils/SingletonUtils";
import {BaseContext} from "./BaseContext";
import {managerContext} from "./App";

export class ManagerContext extends BaseContext<BaseManager> {

	get contentName(): string { return "Manager"; }

	public update(dt: number) {
		this.list.forEach(c => c?.update(dt));
	}
}

// export function useManager<T extends BaseManager>(
// 	clazz: Constructor<T> | string) {
// 	// const ctx = ManagersContext.Get();
// 	const ctx = SingletonUtils.instance(ManagersContext);
// 	return (target, key) => {
// 		console.log("[USE] ", {clazz, target, key});
// 		target[key] = ctx.instance(clazz);
// 	};
// }
export function managerValue<T extends BaseManager>(
	clazz: Constructor<T> | string) {
	return (target, key) => {
		target[key] = getManager(clazz);
		console.log("[MANAGER USE] ", {clazz, target, key});
	};
}

export function managerGetter<T extends BaseManager>(
	clazz: Constructor<T> | string) {
	return (target, key, desc) => {
		desc.value = () : T =>
			target[key+'_CACHE'] ||= getManager(clazz)
	};
}

export function manager<T extends BaseManager>(
	clazz: Constructor<T>) {
	managerContext().create(clazz);
	return clazz;
}

export function getManager<T extends BaseManager>(
	clazz: Constructor<T> | string) {
	// console.error("[USE] ", clazz);
	return managerContext().instance(clazz);
}

export class BaseManager {

	protected deltaTime = -1;

	public update(dt: number) {
		this.deltaTime = dt;
	}

}
