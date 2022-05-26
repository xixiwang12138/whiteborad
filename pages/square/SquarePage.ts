import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";

export type RoomInfo = {
	name:string,
	nickName:string,
	level:number,
	thumbnail:string
}

class Data extends BasePageData {
	roomList: RoomInfo[]
}

@page("square", "广场")
export class SquarePage extends BasePage<Data> {

	public data = new Data();

	@pageFunc
	async onLoad(e) {
		super.onLoad(e);

		this.setData({
			roomList:[{
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
		})
	}

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();
}
