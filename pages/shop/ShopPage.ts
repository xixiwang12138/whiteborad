import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {field} from "../../modules/core/data/DataLoader";

class Data extends BasePageData {

	@field(Array)
	Rooms= [{
		roomStatus: 'changeable'
	},{
		roomStatus: 'using'
	},{
		roomStatus: 'purchasable',price: "4396"
	},{
		roomStatus: 'locked',price: "4396",unlock:"10级解锁购买"
	},{
		roomStatus: 'locked',price: "4396",unlock:"15级解锁购买"
	},]
	@field(Array)
	Others= [{
		roomStatus: 'purchasable',price: "4396"
	},{
		roomStatus: 'owned'
	},{
		roomStatus: 'owned'
	},{
		roomStatus: 'locked',price: "4396",unlock:"解锁房间购买"
	},{
		roomStatus: 'locked',price: "4396",unlock:"解锁房间购买"
	},]
}

// const isRooms=true;
@page("shop", "商城")
export class ShopPage extends BasePage<Data>{

	public data = new Data();

	async onLoad(e) {
		this.setData({
			isRooms:true
		})
	}
		@pageFunc
		//切换小屋
		public tapToChange1(){
			this.setData({
				isRooms:true
			})
		}
		@pageFunc
		//切换小屋
		public tapToChange2(){
			this.setData({
				isRooms:false
			})
		}
		// onLoad: function (options) {
		// 	this.setData({
		// 		isRooms:true
		// 	})
		// },
}

