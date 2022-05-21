import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";

class Data extends BasePageData {}
// const isRooms=true; 
@page("shop", "商城")
export class ShopPage extends BasePage<Data>{
	public data = new Data();
	
	@pageFunc
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

