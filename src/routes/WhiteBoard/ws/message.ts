import {ElementBase, ElementType} from "../app/element/ElementBase";
import {IdGenerator} from "../../../utils/IdGenerator";
import {DataLoader, DataOccasion, field, SerializableData} from "../../../utils/data/DataLoader";
import {Arrow, Line} from "../app/element/Line";
import {FreeDraw} from "../app/element/FreeDraw";
import {TextElement} from "../app/element/TextElement";
import {EllipseElement, GenericElement, RectangleElement} from "../app/element/GenericElement";

type MessageType = "load" | "cmd" | "member"; // load是加载白板的意思

export type Message =  {
    type: MessageType,
    data: string
}

type MemberMessageType = "enter" | "leave";

export type MemberMessage = {
    type: MemberMessageType
    payload: any; // 待定
}

export enum CmdType { //枚举从最后开始添加
    Add,
    Delete,
    // Move,
    Withdraw,
    Adjust, //调整单个属性
    SwitchPage,  //切换页面
    // Scale, //缩放
}

//TODO 修改element数据类型
type Element  = any

//此处CmdPayloads中的值,即为payload

export type CmdPayloads = {
    [CmdType.Add]: ElementBase, //需要增加的元素
    [CmdType.Delete]: null //需要删除的元素
    // [CmdType.Move]: {x: number, y: number}  //移动后的新位置
    [CmdType.Withdraw]: Cmd<CmdType> //需要撤销的操作
    [CmdType.Adjust]: Record<string, [any, any]> //p键值为操作的属性，[0]:before, [1]:after
    [CmdType.SwitchPage]: {from: number, to: number} //从from页面切换到to页面
    // [CmdType.Scale]: {factorH: number, factorV: number} //缩放因子
}

export class Cmd<T extends CmdType> extends SerializableData{
    @field
    id!: string;
    @field
    pageId!: string;
    @field
    type!: T;
    @field
    elementType: ElementType;
    @field
    o?: string; //操作对象的id
    @field
    payload!: string;  //操作的payload, 由于go无法绑定到确定类型，使用string
    @field
    time!: number; //操作的时间戳
    @field
    boardId!: string; //操作所属的白板
    @field
    creator!: string; //操作创建人的userId

    constructor() {
        super();
        this.time = new Date().getTime()
    }
}

interface ElemTypeMapping {
	[ElementType.linear]: Line;
	[ElementType.freedraw]: FreeDraw;
	[ElementType.text]: TextElement;
	[ElementType.generic]: GenericElement;
}

export class CmdBuilder<T extends CmdType> {
    private cmd = new Cmd<T>();

    private convertElem(e: CmdPayloads[T]) {
        let c = this.cmd;
        switch (c.elementType) {
            case ElementType.freedraw:
                c.payload = DataLoader.convert(FreeDraw, e); break;
            case ElementType.generic:
                if((e as GenericElement).genericType === "rectangle") c.payload = DataLoader.convert(RectangleElement, e);
                else c.payload = DataLoader.convert(EllipseElement, e);
                break;
            case ElementType.text:
                c.payload = DataLoader.convert(TextElement, e);
                break;
            case ElementType.linear:
                if((e as Line).linearType === "line") c.payload = DataLoader.convert(Line, e);
                else c.payload = DataLoader.convert(Arrow, e);
                break;
            default:
                throw "unknown element type";
        }
    }

    public setType(t: T) {
        this.cmd.type = t
        return this
    }

    public setUser(userId: string) {
        this.cmd.creator = userId
        this.cmd.id = IdGenerator.genCmdId(userId)
        return this
    }
    public setPage(boardId: string, pageId: string) {
        this.cmd.pageId = pageId;
        this.cmd.boardId = boardId;
        return this
    }

    /**
     * 后于setType调用
     */
    public setPayload(e: CmdPayloads[T]) {
        let c = this.cmd;
        switch (this.cmd.type) {
            case CmdType.Add: this.convertElem(e);break;
            case CmdType.Delete: c.payload = null; break;
            case CmdType.SwitchPage: case CmdType.Adjust: c.payload = JSON.stringify(e); break;
            case CmdType.Withdraw: c.payload = DataLoader.convert(Cmd, e); break;
            default:
                throw "cmd type is not supported";
        }
        return this;
    }

    public setElement(elem:ElementBase) {
        this.cmd.o = elem.id;
        this.cmd.elementType = elem.type;
        return this;
    }

    public build(): Cmd<T> {
        return this.cmd
    }
}

export function loadElemByObject(obj:any):ElementBase {
    switch (obj.type) {
        case ElementType.freedraw:
            return Object.assign<FreeDraw, any>(new FreeDraw(), obj);
        case ElementType.generic:
            if(obj.genericType === "rectangle")
                return Object.assign<RectangleElement, any>(new RectangleElement(), obj);
            else
                return Object.assign<EllipseElement, any>(new EllipseElement(), obj);
        case ElementType.text:
            return Object.assign<TextElement, any>(new TextElement(), obj);
        case ElementType.linear:
            if(obj.linearType === "line")
                return Object.assign<Line, any>(new Line(), obj);
            else
                return Object.assign<Arrow, any>(new Arrow(), obj);
        default:
            throw "unknown element type";
    }
}

export function loadElemByCmd(cmd:Cmd<any>):ElementBase {
   return loadElemByObject(JSON.parse(cmd.payload));
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
        // case CmdType.Move:
        //     const cMove = cmd as Cmd<CmdType.Move>
        //     const x = cMove.payload?.x
        //     const y = cMove.payload?.y
            // TODO
            break
        //TODO .....
    }
}





//使用方法
// const cmd = new CmdBuilder<CmdType.Add>() //一般需要调用五个set方法
//     .setType(CmdType.Add)
//     .setUser(999)
//     .setPage(1,2)
//     .setElement(4324)
//     .setPayload(null!)
//     .build()
// websocketManager.sendMessage(cmd)
