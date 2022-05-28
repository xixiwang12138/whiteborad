// 修饰input事件函数，进行类型检查，如果需要进行处理，则在被修饰函数中返回处理好的值即可
import {Constructor} from "../../../modules/core/BaseContext";
import CustomEvent = WechatMiniprogram.CustomEvent;

export function input(field: string,
											type: Constructor<String | Number | Boolean> = String) {
	return (obj, key, desc) => {
		const oriFunc = desc.value;
		desc.value = function (e: CustomEvent<any>) {
			console.log(key, ":", e);
			let value = oriFunc(e) || e.detail;
			if (typeof value == "object") value = value.value;
			switch (type) {
				case Number: value = Number.parseInt(value); break;
				case Boolean: value = !!value; break;
			}
			this.setData({ [field]: value });
		}
	}
}
