import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";

class Data extends BasePageData {
	isShowStartConfig:boolean
	isShowRoomConfig:boolean
	time:number
}

@page("main", "主页")
export class MainPage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();

	@pageFunc
	async onLoad(e){
		super.onLoad(e);

		this.setData({
			isShowStartConfig:false,
			isShowRoomConfig:false,
			time:60
		})
	}

	@pageFunc
	onClickStart(){
		this.setData({
			isShowStartConfig:!this.data.isShowStartConfig
		})
	}
	@pageFunc
	onClickRoomConfig(){
		this.setData({
			isShowRoomConfig:!this.data.isShowRoomConfig
		})
	}

	@pageFunc
	onClickHide(e){
		console.log(e)
		const targetName = e.currentTarget.dataset.windowname
		switch (targetName){
			case "start":
				this.setData({
					isShowStartConfig:!this.data.isShowStartConfig
				})
				break
			case "room":
				this.setData({
					isShowRoomConfig:!this.data.isShowRoomConfig
				})
				break
		}
	}

	@pageFunc
	onDragTime(e){
		console.log(e);
		this.setData({
			time:e.detail.value
		})
	}

}
