import {BasePageData, BasePage} from "../core/BasePage";
import {page} from "../PageBuilder";
import {BaseData} from "../../../modules/core/data/BaseData";

interface RefreshAbleData {
	refresh();
}

interface Data<D extends BaseData & RefreshAbleData> extends BasePageData {
	item: D;
}

export abstract class ItemDetailPage<
	D extends Data<DD>, DD extends BaseData & RefreshAbleData, P = {}>
	extends BasePage<D, P> {

	/**
	 * 快捷获取当前项
	 */
	public get item() { return this.data.item; }

	/**
	 * 设置数据
	 */
	// public async setData(data: Partial<D> & WechatMiniprogram.IAnyObject, callback?: () => void) {
	// 	if ("item" in data) await this.item.refresh();
	// 	return super.setData(data, callback);
	// }

	/**
	 * 设置项
	 */
	public setItem(item: DD) {
		// @ts-ignore
		return this.setData({ item });
	}

	/**
	 * 设置项内的数据
	 */
	public async setItemData(obj: Partial<DD>) {
		Object.assign(this.item, obj);
		await this.refreshItem();
	}

	/**
	 * 刷新项
	 */
	public async refreshItem() {
		// @ts-ignore
		await this.setData({item: this.item});
	}

}

