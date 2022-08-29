import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr, waitForLogin} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {DataOccasion, field, occasion} from "../../modules/core/data/DataLoader";
import {PlayerEditableInfo} from "../../modules/player/data/Player";
import {input} from "../common/utils/PageUtils";
import {RoomPage} from "../common/partPages/RoomPage";
import {alertMgr} from "../../modules/core/managers/AlertManager";
import InviteConfig from "../../modules/player/config/InviteConfig";
import {configMgr, waitForConfigLoad} from "../../modules/core/managers/ConfigManager";
import {PlayerInviteTask, PlayerTask} from "../../modules/player/data/PlayerTask";
import {handleError} from "../../modules/core/managers/ErrorManager";
import {DefaultSharePage, ShareAppPage} from "../common/partPages/SharePage";

class Data extends BasePageData {

	@field(Array)
	collectedRooms = [{
		userName: "测试君", level: 3, name: "摆烂小屋",slogan:"卷也卷不起，躺也躺不平"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋",slogan:"卷也卷不起，躺也躺不平"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋",slogan:"卷也卷不起，躺也躺不平"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋",slogan:"卷也卷不起，躺也躺不平"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋",slogan:"卷也卷不起，躺也躺不平"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋",slogan:"卷也卷不起，躺也躺不平"
	},{
		userName: "测试君", level: 3, name: "摆烂小屋",slogan:"卷也卷不起，躺也躺不平"
	},];
	@field
	info: PlayerEditableInfo = {};
	@field
	isShowInfoWindow: boolean = false;
	@field
	isShowInviteWindow: boolean = false;

	@field(InviteConfig)
	inviteConfig: InviteConfig;
	@field(PlayerInviteTask)
	inviteTask: PlayerInviteTask;
}

@page("mine", "我的")
export class MinePage extends BasePage<Data> {

	public data = new Data();

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();
	public roomPage: RoomPage = new RoomPage();
	public shareAppPage: ShareAppPage = new ShareAppPage();

	async onLoad(e): Promise<void> {
		await super.onLoad(e);
		await this.setupConfigs();
	}

	@waitForLogin
	@waitForConfigLoad
	private setupConfigs() {
		this.setData({
			inviteConfig: configMgr().config(InviteConfig)
		})
	}

	async onReady() {
		super.onReady();
		await this.onLogin();
	}

	@waitForLogin
	async onLogin() {
		const player = playerMgr().player;
		const pt = playerMgr().getData(PlayerTask);

		this.shareAppPage.extra = {code: player.inviteCode};

		// await this.roomPage.loadSelfRoom();
		await this.setData({
			info: {
				name: player.name,
				slogan: player.slogan,
				gender: player.gender,
				avatarUrl: player.avatarUrl
			},
			inviteTask: pt.inviteTask
		});
	}

	// region 事件

	// region 窗口事件

	// WindowType = "Info" | "Invite";
	@pageFunc
	async onClickShow(e) {
		const window = e.currentTarget.dataset.window;
		await this[`on${window}WindowShow`]?.();
		await this.setData({ [`isShow${window}Window`]: true })
	}
	@pageFunc
	async onClickHide(e) {
		const window = e.currentTarget.dataset.window;
		await this[`on${window}WindowHide`]?.();
		await this.setData({ [`isShow${window}Window`]: false })
	}

	// endregion

	@pageFunc
	onMaleTap() { this.setData({ "info.gender": 1 }); }
	@pageFunc
	onFemaleTap() { this.setData({ "info.gender": 2 }); }

	@pageFunc
	@input("info.name")
	onNameInput() {}
	@pageFunc
	@input("info.slogan")
	onSloganInput() {}

	@pageFunc
	public async onSubmit() {
		await playerMgr().editInfo(this.data.info);
		await this.setData({ isShowInfoWindow: false })
		this.playerPage.resetPlayer()
	}

	@pageFunc
	@handleError
	public async onClaimInvite(e) {
		const index = Number(e.currentTarget.dataset.index);
		const pt = await playerMgr().claimInvite(index);
		this.playerPage.resetPlayer();
		await this.setData({
			inviteTask: pt.inviteTask
		});
		await this.setupConfigs();
		await alertMgr().showToast(`领取成功！`, "success")
	}

	@pageFunc
	public async onRewardCodeTap() {
		const res = await alertMgr().showAlert({
			title: "请输入兑换码",
			showCancel: true, editable: true
		})
		if (res.content) {
			const rc = await playerMgr().useRewardCode(res.content);
			const desc = rc.rewardGroup().description();
			await alertMgr().showAlert(`兑换成功！你已获得 ${desc}！`)
			this.playerPage.resetPlayer();
		}
	}
}
