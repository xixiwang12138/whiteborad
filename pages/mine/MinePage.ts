import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";

class Data extends BasePageData {

}

@page("mine", "我的")
export class MinePage extends BasePage<Data> {

	public data = new Data();
	public isEdit=false
	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();
	@pageFunc
  public tapToEdit(){
    this.setData({
	  isEdit:true
  })
}
 @pageFunc
  public onClose(){
	this.setData({
		isEdit:false
	})
 }
}
