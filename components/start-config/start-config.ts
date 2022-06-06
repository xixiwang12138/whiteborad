import {FocusTags} from "../../modules/focus/data/Focus";

Component({
	properties: {
		focus: {
			type: Object,
			value: {}
		},
		minDuration: {
			type: Number,
			value: 15
		},
		maxDuration: {
			type: Number,
			value: 90
		}
	},
	data: {
		focusTags: FocusTags
	},
	methods: {}
});
