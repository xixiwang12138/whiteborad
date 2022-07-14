import {getSingleton, singleton} from "../../../utils/SingletonUtils";
import {BaseContext, Constructor} from "../BaseContext";

const UpdateInterval = 50; // 更新间隔

@singleton
export class ManagerContext extends BaseContext {

	public updateTask;

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

export function startUpdateContext() {
	const context = managerContext();
	console.log("startUpdateContext", context.updateTask)
	if (context.updateTask) return;
	context.updateTask = setInterval(
		updateContext, UpdateInterval
	)
}
export function stopUpdateContext() {
	const context = managerContext();
	console.log("stopUpdateContext", context.updateTask)
	if (!context.updateTask) return;
	clearInterval(context.updateTask);
	context.updateTask = null;
}

export class BaseManager {

	public lastUpdateTime = 0;
	public deltaTime = 0;

	public update() {
		const now = Date.now();
		if (this.lastUpdateTime > 0)
			this.deltaTime = now - this.lastUpdateTime
		this.lastUpdateTime = now;
	}

}
