import {websocketManager} from "./websocketManager";
import exp from "constants";

export enum CmdType { //枚举从最后开始添加
    Add,
    Delete,
    Move,
    Withdraw,
    Adjust, //调整单个属性
    SwitchPage,  //切换页面
    Scale, //缩放
}




//TODO 修改element数据类型
type Element  = any

//此处CmdPayloads中的值,即为payload
type CmdPayloads = {
    [CmdType.Add]: Element //需要增加的元素
    [CmdType.Delete]: number //需要删除的元素
    [CmdType.Move]: {x: number, y: number}  //移动后的新位置
    [CmdType.Withdraw]: Cmd<CmdType> //需要撤销的操作
    [CmdType.Adjust]: {p: string, value: any} //p为操作的属性，v为修改后的值
    [CmdType.SwitchPage]: {from: number, to: number} //从from页面切换到to页面
    [CmdType.Scale]: {factorH: number, factorV: number} //缩放因子
}

export class Cmd<T extends CmdType>{
    id?: number;
    pageId?: number;
    type: T | undefined;
    o?: number; //操作对象的id
    payload?: CmdPayloads[T];  //操作的payload
    time?: number; //操作的时间戳
    boardId?: number; //操作所属的白板
    creator?: number; //操作创建人的userId


    constructor() {
        this.id = 0  //TODO 随机生成id
        this.time = new Date().getTime()
    }
}



export class CmdBuilder<T extends CmdType> {
    private cmd = new Cmd<T>();

    public setType(t: T) {
        this.cmd.type = t
        return this
    }

    public setUser(userId: number) {
        this.cmd.creator = userId
        return this
    }
    public setPage(boardId: number, pageId: number) {
        this.cmd.pageId = pageId;
        this.cmd.boardId = boardId;
        return this
    }

    public setPayload(e: CmdPayloads[T]) {
        this.cmd.payload = e
        return this
    }

    public setElement(id: number) {
        this.cmd.o = id
        return this
    }

    public build(): Cmd<T> {
        return this.cmd
    }
}

export function onMessageHandler(ev: MessageEvent) {
    const message = ev.data
    let cmd = JSON.parse(message) as Cmd<CmdType>
    switch (cmd.type) { //TODO 完善处理方式
        case CmdType.Add:
            const cAdd = cmd as Cmd<CmdType.Add>
            break
        case CmdType.Delete:
            cmd = cmd as Cmd<CmdType.Delete>
            break
        case CmdType.Move:
            const cMove = cmd as Cmd<CmdType.Move>
            const x = cMove.payload?.x
            const y = cMove.payload?.y
            // TODO
            break
        //TODO .....
    }
}





//使用方法
const cmd = new CmdBuilder<CmdType.Add>() //一般需要调用五个set方法
    .setType(CmdType.Add)
    .setUser(999)
    .setPage(1,2)
    .setElement(4324)
    .setPayload(1212)
    .build()
websocketManager.sendMessage(cmd)
