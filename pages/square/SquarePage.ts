import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr, waitForLogin} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {VisitPage} from "../visit/VisitPage";
import {RoomPage} from "../common/partPages/RoomPage";
import {field} from "../../modules/core/data/DataLoader";

export type RoomInfo = {
	name:string,
	nickName:string,
	level:number,
	thumbnail:string
}

class Data extends BasePageData {

	@field([Object])
	roomList: RoomInfo[] = [{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	},{
		name:"摆烂小屋",
		nickName:"摆烂君",
		level:3,
		thumbnail: "../../assets/common/3.png"
	}]
}

@page("square", "广场")
export class SquarePage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();
	public roomPage: RoomPage = new RoomPage();

	async onReady() {
		super.onReady();
		await this.onLogin();
	}

	@waitForLogin
	async onLogin() {
		await this.roomPage.loadSelfRoom();
	}

	@pageFunc
	toVisit(){
		pageMgr().push<any, BasePage>(VisitPage)
	}
}
