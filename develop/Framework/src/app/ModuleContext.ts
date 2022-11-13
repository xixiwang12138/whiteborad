import {Constructor, getSingleton} from "../utils/SingletonUtils";
import {BaseInterface} from "./BaseInterface";
import {BaseContext} from "./BaseContext";

export class ModuleContext extends BaseContext<BaseModule> {

	get contentName(): string { return "Module"; }

}

export abstract class BaseModule {

	public interfaces: BaseInterface[] = [];

	protected abstract installedInterfaces(): Constructor[];

	protected abstract usingData(): Constructor[];

	constructor() {
		this.installedInterfaces().forEach(
			this.registerInterface.bind(this)
		)
	}

	public registerInterface<T extends BaseInterface>(
		clazz: Constructor<T>) {
		this.interfaces.push(getSingleton(clazz));
	}

	public importClasses() {}

	public update() { }

}
