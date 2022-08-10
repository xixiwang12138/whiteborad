import {page, pageFunc} from "../common/PageBuilder";
import {BasePage, BasePageData} from "../common/core/BasePage";
import {playerMgr} from "../../modules/player/managers/PlayerManager";
import {PlayerPage} from "../common/partPages/PlayerPage";
import {field} from "../../modules/core/data/DataLoader";
import {PlayerEditableInfo, PlayerState} from "../../modules/player/data/Player";
import {pageMgr} from "../../modules/core/managers/PageManager";
import {input} from "../common/utils/PageUtils";

const LoginDesc = "个人信息仅用于展示";

type Bubble = {
	left: number
	top: number
	visible: boolean
}

class Data extends BasePageData {

	@field
	info: PlayerEditableInfo = {};
	@field
	isLogin: boolean = false;
	@field
	isNewer: boolean = false;
	@field
	bubbles: Bubble[] = [];
	// @field
	// clientW: number = 0;
	// @field
	// clientH: number = 0;
}

@page("login", "登陆")
export class LoginPage extends BasePage<Data> {

	public data = new Data();
	private interval

	/**
	 * 部分页
	 */
	public playerPage: PlayerPage = new PlayerPage();

	onReady() {
		super.onReady();
		this.playerPage.registerOnLogin(() => this.onLogin());
		this.setupBubbles();
	}

	// region 事件

	async onLogin() {
		const player = this.playerPage.player;
		await this.setData({
			info: {
				name: player.name,
				slogan: player.slogan,
				gender: player.gender,
				avatarUrl: player.avatarUrl
			},
			isLogin: true
		});
		// 如果是新人
		if (player.state == PlayerState.Newer) {
			await this.setData({ isNewer: true });
			await this.processInvite();
		} else await pageMgr().goto(MainPage);
	}

	private async processInvite() {
		const inviteCode = this.getExtra("code");
		if (inviteCode) await playerMgr().invitePlayer(inviteCode);
	}

	// region 页面事件

	@pageFunc
	onMaleTap() {
		this.setData({ "info.gender": 1 });
	}
	@pageFunc
	onFemaleTap() {
		this.setData({ "info.gender": 2 });
	}

	@pageFunc
	@input("info.name")
	onNameInput() {}

	@pageFunc
	@input("info.slogan")
	onSloganInput() {}

	@pageFunc
	public tapToLogin() {
		this.playerPage.manualLogin(LoginDesc).then();
	}

	@pageFunc
	public async getPhoneNumber(e) {
		console.log(e.detail.code)
		if (!e.detail.code) return;
		// getPhone函数返回值
		await playerMgr().getPhone(e.detail.code)
		await this.playerPage.setData({
			userInfo: this.playerPage.player
		});
	}

	@pageFunc
	public async onSubmit() {
		await playerMgr().editInfo(this.data.info);
		await pageMgr().goto(MainPage);
	}

	// endregion

	// endregion

	// region Bubble动画

	/**
	 * 初始化Bubble动画
	 */
	private setupBubbles() {
		let bubbles = this.data.bubbles;
		this.interval = setInterval(() => {
			console.log("setupBubbles", this)
			// 控制Bubble数量
			if (bubbles.length <= 25) this.addItem();
			this.move()
			// 之前的问题是因为这里Clear了，动画就不会继续播放了
			// clearInterval(this.interval)
		}, 500);
	}
	private async addItem() {
		let bubbles = this.data.bubbles;
		let left, top;
		// xp改为百分比定位
		left = MathUtils.random(10, 90);
		top = 110; // this.data.contentHeight;
		bubbles.push({ left, top, visible: true });
		await this.setData({ bubbles })
	}
	private async move() {
		let bubbles = this.data.bubbles

		for (const bubble of bubbles) {
			// 到了最上方之后重置
			if (bubble.top < -50) bubble.top = 110;

			let speed = Math.floor(Math.random() * 20) + 10; // 定义总体速度

			// 随机设置在x和y方向的速度
			let theta = Math.floor(Math.random() * speed) + 10 * Math.PI * Math.random();
			let speedX = Math.floor(speed * Math.cos(theta));
			let speedY = -Math.floor(4 * speed * Math.random());

			bubble.left += speedX / 8;
			bubble.top += speedY / 8;

			bubble.visible = bubble.top >= -50 && bubble.top <= 110

			await this.setData({ bubbles })
		}
	}

	// endregion

}

import {MainPage} from "../main/MainPage";
import {MathUtils} from "../../utils/MathUtils";
