import CustomEvent = WechatMiniprogram.CustomEvent;

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		type: {
			type: String,
			value: "text"
		},
		placeholder: {
			type: String,
			value: ""
		},
		maxLength: {
			type: String,
			value: "256"
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		value: "",
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		onInput(e:CustomEvent){
			let value= e.detail.value;
			switch (this.properties.type){
				case "uint":
					if(/[^0-9]/.test(value)) this.setData({value: this.data.value});
					else this.setData({value});
					break;
				case "float":
					if(/[^0-9.]|\..+\.|\.{2}/.test(value)) this.setData({value: this.data.value});
					else this.setData({value});
					break;
				default:
					this.setData({value});
			}
			this.triggerEvent("input", this.data.value);
		}
	}
})
