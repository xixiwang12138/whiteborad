import {BaseManager, getManager, manager} from "../core/managers/BaseManager";
import {playerMgr} from "../player/managers/PlayerManager";
import SocketTask = WechatMiniprogram.SocketTask;

export function wsMgr() {
	return getManager(WebSocketManager)
}
// const Host = "wss://homi-ws-server-1836805-1255510304.ap-shanghai.run.tcloudbase.com";
const Host = "ws://localhost:3000";

@manager
export class WebSocketManager extends BaseManager {

	public connect(type: string, routes: string[],
								 onMessage: (data: any) => any) {
		const openid = playerMgr().openid;
		const url = `${Host}/${openid}/${type}/${routes.join("/")}`;

		// TODO: 需要进一步封装
		const task = wx.connectSocket({ url });

		task.onMessage(msg =>
			onMessage(JSON.parse(msg.data as string)));

		return task;
	}

}
