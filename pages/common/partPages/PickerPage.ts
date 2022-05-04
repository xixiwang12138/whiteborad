import {PartialPage} from "../core/BasePage";
import {pageFunc} from "../PageBuilder";
import {BaseData} from "../../../modules/core/data/BaseData";
import {field} from "../../../modules/core/data/DataLoader";

export type PickerData = {
	name: ColumnItem,
	sub?: PickerData
}[];
export type ColumnItem = string | {
	text: string, disabled: boolean
}
export type Column = {
	values: ColumnItem[], className?: string, defaultIndex?: number
};
export type Columns = Column[];

class Data extends BaseData {
	@field
	showPicker: boolean = false;
	@field(String)
	pickerTitle: string;
	@field([Object])
	pickerData: PickerData = []
	@field([Object])
	pickerColumns: Columns = []
	@field
	pickerIndex: number = 0;
}

export class PickerPage extends PartialPage<Data> {

	public data = new Data();

	private resolve;

	/**
	 * 启动Picker
	 */
	public startPicker(title: string,
										 data: PickerData,
										 indexes?: number | number[]) {

		if (this.resolve) return [];
		if (typeof indexes === "number") indexes = [indexes];

		this.setData({ pickerData: data });
		this.setData({
			showPicker: true,
			pickerTitle: title,
			pickerColumns: this.makeColumns(indexes)
		})

		return new Promise<number[]>(resolve => {
			this.resolve = resolve;
		})
	}

	/**
	 * 获取列数
	 */
	private getColCnt(data?: PickerData, base = 0) {
		let res = base;
		data ||= this.data.pickerData;
		if (!data || data.length <= 0) return base;

		data.filter(i => i.sub).forEach(
			i => res = Math.max(this.getColCnt(i.sub, base), res)
		)
		return res + 1;
	}

	/**
	 * 从PickerData转化为单个Column
	 */
	private getColumn(colIdx: number, indexes: number[]) {
		return {
			values: this.getColumnValues(colIdx, indexes),
			defaultIndex: indexes[colIdx]
		}
	}

	/**
	 * 从PickerData转化为单个Column
	 */
	private getColumnValues(colIdx: number, indexes: number[]) {
		let res = this.data.pickerData;
		for (let i = 0; i < colIdx; i++) {
			res = res[indexes[i]].sub;
			if (!res) return [];
		}
		return res.map(i => i.name);
	}

	/**
	 * 从PickerData转化为PickerColumns
	 */
	private makeColumns(indexes?: number[]) {
		const colCnt = this.getColCnt();

		if (indexes === undefined) {
			indexes = [];
			for (let i = 0; i < colCnt; i++) indexes.push(0);
		}

		const res: Columns = [];
		for (let i = 0; i < colCnt; i++)
			res[i] = this.getColumn(i, indexes)

		console.log(res)
		return res;
	}

	/**
	 * 值数组转化为索引数组
	 */
	private values2Indexes(values: string[]) {
		let data = this.data.pickerColumns;
		return values.map((v, i) =>
			data[i].values.findIndex(item => v ===
				(typeof item === "string" ? item : item.text)));
	}

	// region 事件

	/**
	 * Picker变化回调
	 */
	@pageFunc
	private onPickerChange(e) {
		console.log("onPickerChange", e, this);
		const { picker, value, index } = e.detail;

		const indexes = this.values2Indexes(value);
		for (let i = index + 1; i < indexes.length; i++) {
			const values = this.getColumnValues(i, indexes);
			this.data.pickerColumns[i].values = values;
			picker.setColumnValues(i, values);
		}
	}

	/**
	 * Picker选择回调
	 */
	@pageFunc
	private onPickerConfirm(e) {
		console.log("onPickerConfirm", e, this);
		this.setData({ showPicker: false })

		if (!this.resolve) return;

		const index = e.detail.index;
		this.resolve(index);
		this.resolve = null;
	}

	/**
	 * Picker取消回调
	 */
	@pageFunc
	private onPickerCancel(e) {
		console.log("onPickerCancel", e, this);
		this.setData({ showPicker: false })

		if (!this.resolve) return;

		this.resolve(null);
		this.resolve = null;
	}

	// endregion

}
