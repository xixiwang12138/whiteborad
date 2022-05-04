import Options = WechatMiniprogram.Page.Options;
import IAnyObject = WechatMiniprogram.IAnyObject;
import BehaviorIdentifier = WechatMiniprogram.Behavior.BehaviorIdentifier;
import TriggerEventOption = WechatMiniprogram.Component.TriggerEventOption;
import SelectorQuery = WechatMiniprogram.SelectorQuery;
import CreateIntersectionObserverOption = WechatMiniprogram.CreateIntersectionObserverOption;
import IntersectionObserver = WechatMiniprogram.IntersectionObserver;
import TrivialInstance = WechatMiniprogram.Component.TrivialInstance;
import ScrollTimelineKeyframe = WechatMiniprogram.Component.ScrollTimelineKeyframe;
import KeyFrame = WechatMiniprogram.Component.KeyFrame;
import ScrollTimelineOption = WechatMiniprogram.Component.ScrollTimelineOption;
import ClearAnimationOptions = WechatMiniprogram.Component.ClearAnimationOptions;
import {BaseData} from "../../../modules/core/data/BaseData";
import {DataLoader, DataOccasion} from "../../../modules/core/data/DataLoader";

/**
 * 基本页面类（仅用于帮助代码补全）
 */
export abstract class RootPage<D extends BaseData = any>
	implements Options<D, any> {

	data: D

	abstract get callPage(): RootPage;

	/** 页面的文件路径 */
	is: string

	/** 到当前页面的路径 */
	route: string

	/** 打开当前页面路径中的参数 */
	options: Record<string, string | undefined>

	/** `setData` 函数用于将数据从逻辑层发送到视图层
	 *（异步），同时改变对应的 `this.data` 的值（同步）。
	 *
	 * **注意：**
	 *
	 * 1. **直接修改 this.data 而不调用 this.setData 是无法改变页面的状态的，还会造成数据不一致**。
	 * 1. 仅支持设置可 JSON 化的数据。
	 * 1. 单次设置的数据不能超过1024kB，请尽量避免一次设置过多的数据。
	 * 1. 请不要把 data 中任何一项的 value 设为 `undefined` ，否则这一项将不被设置并可能遗留一些潜在问题。
	 */
	async setData(
		/** 这次要改变的数据
		 *
		 * 以 `key: value` 的形式表示，将 `this.data` 中的 `key` 对应的值改变成 `value`。
		 *
		 * 其中 `key` 可以以数据路径的形式给出，支持改变数组中的某一项或对象的某个属性，如 `array[2].message`，`a.b.c.d`，并且不需要在 this.data 中预先定义。
		 */
		data: Partial<D> & IAnyObject,
		/** setData引起的界面更新渲染完毕后的回调函数，最低基础库： `1.5.0` */
		callback?: () => void
	): Promise<void> {
		for (const key in data) {
			const val = data[key];
			if (/[.\[\]]/.test(key)) // 路径设置
				await this.evalSetDataPath(key, val);
			else
				await this.refreshData(this.data[key] = val);
		}

		// 更新微信Page数据
		const data_: any = DataLoader.convert(DataOccasion.Extra, data);
		return this.callPage?.setData(data_, callback)
	}
	private async evalSetDataPath(key: string, val) {
		const subs = key.split('.');
		let data = this.data, root;
		for (let i = 0; i < subs.length; i++) {
			const match = /(\w+?)\[(\d+?)]/.exec(subs[i]);
			const idx = match && Number.parseInt(match[2]);
			const sub = match ? match[1] : subs[i];

			if (i == subs.length - 1) // 最后一项
				match ? (data[sub][idx] = val) : (data[sub] = val);
			else
				data = (match ? data[sub][idx] : data[sub]);

			if (i == 0) root = data; // 设置刷新根节点
		}
		await this.refreshData(root);
	}
	private async refreshData(data, vis = []) {
		if (!data || typeof data != "object" ||
			vis.includes(data)) return;

		vis.push(data);
		if (data.refresh instanceof Function) await data.refresh();
		for (const key in data)
			await this.refreshData(data[key], vis);
	}

	/** 检查组件是否具有 `behavior` （检查时会递归检查被直接或间接引入的所有behavior） */
	hasBehavior(behavior: BehaviorIdentifier): void {
		return this.callPage?.hasBehavior(behavior);
	}

	/** 触发事件，参见组件事件 */
	triggerEvent<DetailType = any>(
		name: string,
		detail?: DetailType,
		options?: TriggerEventOption
	): void {
		return this.callPage?.triggerEvent(name, detail, options);
	}

	/** 创建一个 SelectorQuery 对象，选择器选取范围为这个组件实例内 */
	// @ts-ignore
	createSelectorQuery(): SelectorQuery {
		return this.callPage?.createSelectorQuery();
	}

	/** 创建一个 IntersectionObserver 对象，选择器选取范围为这个组件实例内 */
	createIntersectionObserver(
		options: CreateIntersectionObserverOption
		// @ts-ignore
	): IntersectionObserver {
		return this.callPage?.createIntersectionObserver(options);
	}

	/** 使用选择器选择组件实例节点，返回匹配到的第一个组件实例对象（会被 `wx://component-export` 影响） */
	// @ts-ignore
	selectComponent(selector: string): TrivialInstance {
		return this.callPage?.selectComponent(selector);
	}

	/** 使用选择器选择组件实例节点，返回匹配到的全部组件实例对象组成的数组 */
	// @ts-ignore
	selectAllComponents(selector: string): TrivialInstance[] {
		return this.callPage?.selectAllComponents(selector);
	}

	/**
	 * 选取当前组件节点所在的组件实例（即组件的引用者），返回它的组件实例对象（会被 `wx://component-export` 影响）
	 *
	 * 最低基础库版本：[`2.8.2`](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html)
	 **/
	// @ts-ignore
	selectOwnerComponent(): TrivialInstance {
		return this.callPage?.selectOwnerComponent();
	}

	/** 获取这个关系所对应的所有关联节点，参见 组件间关系 */
	// @ts-ignore
	getRelationNodes(relationKey: string): TrivialInstance[] {
		return this.callPage?.getRelationNodes(relationKey);
	}

	/**
	 * 立刻执行 callback ，其中的多个 setData 之间不会触发界面绘制（只有某些特殊场景中需要，如用于在不同组件同时 setData 时进行界面绘制同步）
	 *
	 * 最低基础库版本：[`2.4.0`](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html)
	 **/
	groupSetData(callback?: () => void): void {
		return this.callPage?.groupSetData(callback);
	}

	/**
	 * 返回当前页面的 custom-tab-bar 的组件实例
	 *
	 * 最低基础库版本：[`2.6.2`](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html)
	 **/
	// @ts-ignore
	getTabBar(): TrivialInstance {
		return this.callPage?.getTabBar();
	}

	/**
	 * 返回页面标识符（一个字符串），可以用来判断几个自定义组件实例是不是在同一个页面内
	 *
	 * 最低基础库版本：[`2.7.1`](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html)
	 **/
	// @ts-ignore
	getPageId(): string {
		return this.callPage?.getPageId();
	}

	/**
	 * 执行关键帧动画，详见[动画](https://developers.weixin.qq.com/miniprogram/dev/framework/view/animation.html)
	 *
	 * 最低基础库版本：[`2.9.0`](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html)
	 **/
	animate(
		selector: string,
		keyFrames: KeyFrame[] | ScrollTimelineKeyframe[],
		duration: number,
		callback?: () => void | ScrollTimelineOption
	): void {
		return this.callPage?.animate(selector, keyFrames, duration, callback);
	}

	/**
	 * 清除关键帧动画，详见[动画](https://developers.weixin.qq.com/miniprogram/dev/framework/view/animation.html)
	 *
	 * 最低基础库版本：[`2.9.0`](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html)
	 **/
	clearAnimation(
		selector: string,
		options?: () => void | ClearAnimationOptions,
		callback?: () => void
	): void {
		return this.callPage?.clearAnimation(selector, options, callback);
	}

	// @ts-ignore
	getOpenerEventChannel(): EventChannel {
		return this.callPage?.getOpenerEventChannel();
	}
}
