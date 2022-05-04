import {BasePageData, PartialPage} from "../core/BasePage";
import {page, pageFunc} from "../PageBuilder";
import CustomEvent = WechatMiniprogram.CustomEvent;
import {BaseData} from "../../../modules/core/data/BaseData";
import {field} from "../../../modules/core/data/DataLoader";

class Data extends BaseData {

	@field(Number)
	datePickerValue: number;
	@field(Number)
	datePickerMin: number;
	@field(Number)
	datePickerMax: number;

	@field
	datePickerTitle: string = "";
	@field
	showDatePicker: boolean = false;
}

const MinDateTime = new Date(2000, 0, 1).getTime();
const MaxDateTime = new Date(2050, 0, 1).getTime();

export class DatePicker extends PartialPage<Data>{

	public data = new Data();

	private resolve;

	/**
	 * 开始日期选择
	 */
	public startPicker(title: string, default_?: number,
										 minDate?: number, maxDate?: number) {
		if (this.resolve) return 0;

		this.setData({
			showDatePicker: true,
			datePickerTitle: title,
			datePickerMin: minDate || MinDateTime,
			datePickerMax: maxDate || MaxDateTime,
			datePickerValue: default_ || Date.now()
		})

		return new Promise<number>(resolve => {
			this.resolve = resolve;
		})
	}

	@pageFunc
	public async onDatePickerConfirm(e: CustomEvent<any>) {
		await this.setData({showDatePicker: false})
		console.log(e.detail);
		if (!this.resolve) return;

		this.resolve(e.detail);
		this.resolve = null;
	}

	@pageFunc
	public onDatePickerCancel(){
		this.setData({showDatePicker: false});

		this.resolve(null);
		this.resolve = null;
	}



}
