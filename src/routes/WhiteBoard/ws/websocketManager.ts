import {Cmd, CmdPayloads, CmdType, Message} from "./message";
import {DataLoader, DataOccasion} from "../../../utils/data/DataLoader";

const host = 'ws://localhost:10400'

// const host = 'ws://175.178.81.93:10400'
// const host = 'ws://192.168.137.17:10400'
// const host = 'ws://175.178.81.93:10400'

export interface IWebsocket {
    onOpen: ((ev: Event) => any) | null;
    onClose: ((ev: CloseEvent) => any) | null;
    onError: ((ev:Event ) => any) | null;
    onMessage: ((ev: MessageEvent) => any) | null;
}

export class WebsocketManager {
    public ws: WebSocket | undefined;
    private readonly onOpen: ((ev: Event) => any) | null;
    private readonly onClose: ((ev: CloseEvent) => any) | null;
    private readonly onError: ((ev:Event ) => any) | null;
    private readonly onMessage: ((ev: MessageEvent) => any) | null;

    private boardId: string = "";
    private userId: string = "";


    constructor(impl:IWebsocket) {
        this.onOpen = impl.onOpen;
        this.onClose = impl.onClose;
        this.onMessage = impl.onMessage;
        this.onError = impl.onError;
    }


    /**
     * 返回websocket是否是连接状态
     */
    public connecting(): boolean {
        if(!this.ws) {
            return false
        }
        return true
    }

    /**
     * 发起连接
     * @param boardId 连接的白板id
     * @param userId 用户id
     */
    public connect(boardId: string, userId: string) {
        console.log(boardId, userId)
        if(this.connecting()) return
        this.boardId = boardId;
        this.userId = userId;
        this.ws = new WebSocket(`${host}/${boardId}/${userId}`);
        //绑定各种事件的处理方法
        this.ws.onmessage = this.onMessage
        this.ws.onopen = this.onOpen
        this.ws.onclose = this.onClose
        this.ws.onerror = this.onError
    }

    /**
     * 重新连接
     */
    public reconnect() {
        if(this.connecting()) return
        this.connect(this.boardId, this.userId)
    }

    public disconnect() {
        if(this.connecting()) {
            this.ws?.close()
            this.ws = undefined;
            this.userId = "";
            this.boardId = "";
        }
    }

    /**
     * 发送消息
     */
    public sendCmd<T extends CmdType>(cmd: Cmd<T>) {
        let msg:Message = {type: "cmd", data:JSON.stringify(cmd)};
        this.ws?.send(JSON.stringify(msg));
    }

}
