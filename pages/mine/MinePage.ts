import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {field} from "../../modules/core/data/DataLoader";

class Data extends BasePageData {

	@field(Array)
	collectedRooms = [{
		userName: "测试君", level: 3, name: "摆烂12小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋"
	}]

	@field
	isEdit = false
}

@page("mine", "我的")
export class MinePage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();

	@pageFunc
  public onAvatarTap(){
    this.setData({ isEdit: true }).then()
	}

  @pageFunc
  public onClose(){
		this.setData({ isEdit: false }).then()
 	}
}
