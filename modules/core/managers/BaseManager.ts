import {getSingleton, singleton} from "../../../utils/SingletonUtils";
import {BaseContext, Constructor} from "../BaseContext";

const UpdateInterval = 20; // 更新间隔

@singleton
export class ManagerContext extends BaseContext {

	get contentName(): string { return "Manager"; }

	public update() {
		this.contents.forEach(c => c.value?.update());
	}

}

export function manager<T extends BaseManager>(
	clazz: Constructor<T>) {
	managerContext().create(clazz, new clazz());
	return clazz;
}

function managerContext() {
	return getSingleton(ManagerContext);
}

export function getManager<T extends BaseManager>(
	clazz: Constructor<T>) {
	return managerContext().instance(clazz);
}

function updateContext() {
	managerContext().update();
}
setInterval(updateContext, UpdateInterval);

export class BaseManager {

	public update() { }

}
