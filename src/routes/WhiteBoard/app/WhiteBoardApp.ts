import {DrawingScene, OnRenderListener} from "./DrawingScene";
import {ToolType} from "./tools/Tool";
import {ToolBox} from "./tools/ToolBox";
import {SecondLevelType} from "../components/ToolList";
import {GenericElementTool} from "./tools/GenericElementTool";
import {GenericElementType} from "./element/GenericElement";
import {LinearElementType, LinearTool} from "./tools/LinearTool";
import {TextTool} from "./tools/TextTool";
import {
    Cmd,
    CmdBuilder,
    CmdPayloads,
    CmdType,
    loadElemByCmd,
    MemberMessage,
    MemberMessageType,
    Message
} from "../ws/message";
import {OnElemSelected, Selection} from "./tools/Selection";
import {IWebsocket, WebsocketManager} from "../ws/websocketManager";
import {OperationTracker} from "./operationTracker/OperationTracker";
import {DataLoader} from "../../../utils/data/DataLoader";
import {WhiteBoard} from "./data/WhiteBoard";
import {UserInfo, UserManager} from "../../../UserManager";
import {message} from "antd";
import {PictureBook} from "./PictureBook";
import {ElementBase} from "./element/ElementBase";
import {createPage} from "../../../api/api";
import {Page} from "./data/Page";
import {ElementSum, ToolReactor} from "../components/WindowToolBar";
import {Eraser} from "./tools/Eraser";
import {BoardMode} from "../index";
import {InteractEvent} from "./event/InteractEvent";

export type OnMember = (user:UserInfo, type:MemberMessageType) => void;

export class WhiteBoardApp implements IWebsocket, ToolReactor {

    public whiteBoard:WhiteBoard;

    private readonly scene:DrawingScene;

    private book:PictureBook = new PictureBook(); // 管理页面的对象

    private wsClient:WebsocketManager;

    private toolBox: ToolBox;

    public cmdTracker:OperationTracker<Cmd<any>>;

    public onClose = () => {
        message.warn("连接已关闭")
    }

    public onOpen = () => {
        message.success("连接到远程白板").then();
    }

    public onError = () => {}

    public onMessage = (e:MessageEvent) => {
        const message = JSON.parse(e.data) as Message;
        switch (message.type) {
            case "load":
                this.book.loadPage(message.data);
                this.scene.renderPage(this.book.curPage);
                break;
            case "cmd":
                const cmd = DataLoader.load(Cmd, message.data);
                this.handleCmdMessage(cmd);
                break;
            case "member":
                let memberMsg = message.data as MemberMessage;
                if(memberMsg.type === "enter") {
                    this.onMember(memberMsg.payload, "enter");
                } else {
                    this.onMember(memberMsg.payload, "leave")
                }
                break;

        }
    }

    public onSwitchMode= (mode: BoardMode) => {};

    public onMember:OnMember = () => {}

    constructor(whiteBoard:WhiteBoard) {
        this.scene = new DrawingScene();
        this.toolBox  = new ToolBox(this.scene);
        this.wsClient = new WebsocketManager(this);
        this.cmdTracker = new OperationTracker<Cmd<any>>(10);
        this.whiteBoard = whiteBoard;
    }

    public setup() {
        this.wsClient.connect(this.whiteBoard.id, UserManager.getId());
        this.setupListeners();
    }

    private setupListeners() {
        this.toolBox.setOnCreateListener( (e) => {
            let cmd = new CmdBuilder<CmdType.Add>()
                .setType(CmdType.Add).setPage(this.whiteBoard.id, this.book.curPage)
                .setUser(UserManager.getId()).setElement(e)
                .setPayload(e).build();
            this.cmdTracker.do(cmd); // 执行操作
            this.book.addElemInPage(e, this.book.curPage.id);
            this.wsClient.sendCmd(cmd);
        });
        this.toolBox.addOnModifyListener(CmdType.Adjust, (t, e,p) => {
            let cmd = new CmdBuilder<CmdType.Adjust>()
                .setType(CmdType.Adjust).setPage(this.whiteBoard.id, this.book.curPage)
                .setUser(UserManager.getId()).setElement(e)
                .setPayload(p).build();
            this.cmdTracker.do(cmd);
            this.wsClient.sendCmd(cmd);
        });
        this.toolBox.addOnModifyListener(CmdType.Delete, (t, e) => {
            let cmd = new CmdBuilder<CmdType.Delete>().setType(CmdType.Delete)
                .setPage(this.whiteBoard.id, this.book.curPage)
                .setUser(UserManager.getId()).setElement(e)
                .build();
            this.cmdTracker.do(cmd);
            // this.book.deletePage() 设置了delete属性，所有引用都会同步
            // this.deleteElem(e); 工具已经执行过了
            this.wsClient.sendCmd(cmd);
        });
    }

    public setOnRenderListener(listener:OnRenderListener) {
        this.scene.onRender =  (c:DrawingScene) => {
            listener(c);
        }
    }

    /**
     * 注册有元素被选择监听器
     */
    public setOnElemSelectedListener(onSelected:OnElemSelected) {
        (this.toolBox.getTool("selection") as Selection).onElemSelected = onSelected;
    }

    public selectTool(type:ToolType, second?:SecondLevelType) {
        // if(type !== "selection") {
        //    this.scene.unSelectAll();
        // }
        this.toolBox.setCurTool(type);
        if(second) {
            if(type === "generic") {
                (this.toolBox.curTool as GenericElementTool).shape = second as GenericElementType;
            } else {
                (this.toolBox.curTool as LinearTool).shape = second as LinearElementType;
            }
        }
        (this.toolBox.getTool("selection") as Selection).unSelectedCurElem();
        let textTool = this.toolBox.getTool("text") as TextTool;
        if(textTool.curElem) {
            if(textTool.finishEditing()) {
                this.scene.deactivateElem()
            } else {
                this.scene.dropActElem();
            }
        } else {
            this.scene.deactivateElem();
        }

    }

    public dispatchInteractEvent(e:InteractEvent) {
        this.toolBox.curTool.op(this.scene.toSceneEvent(e), this.scene);
        // // 使用完除了选择工具之后，切换回选择工具
        // if(e.type === "mouseup" && this.toolBox.curTool.type !== "selection" && this.toolBox.curTool.type !== "eraser") {
        //     this.toolBox.setCurTool("selection");
        // }
    }

    public refreshScene() {
        this.scene.render();
    }

    // 返回是否成功缩放
    public zoomScene(dScale:number, sx:number, sy:number):number {
        if((dScale < 0 && this.scene.scale >= 0.2) || (dScale > 0 && this.scene.scale <= 2)) {
            this.scene.zoom(dScale, sx, sy);
            return this.scene.scale;
        }
        return -1;
    }

    public translateScene(dx:number, dy:number) {
        this.scene.translate(dx, dy);
    }

    public undo() {
        let cmd = this.cmdTracker.undo()
        if(cmd) {
            let elem = this.undoCmd(cmd);
            let wdCmd = new CmdBuilder<CmdType.Withdraw>()
                .setType(CmdType.Withdraw).setUser(UserManager.getId())
                .setElement(elem).setPage(cmd.boardId, this.book.curPage)
                .setPayload(cmd).build();
            this.wsClient.sendCmd(wdCmd);
        }
    }

    /**
     *  @return 受到影响的元素
     */
    private undoCmd(cmd:Cmd<any>):ElementBase | null {
        let elem = this.book.findElemInPage(cmd.o,  true);
        switch (cmd.type) {
            case CmdType.Add: this.deleteElemByCmd(cmd); break;
            case CmdType.Delete: this.addElemByCmd(cmd); break;
            case CmdType.Adjust: this.adjustByCmd(cmd, true); break;
            default:
                throw "command is not supported";
        }
        return elem;
    }

    public redo() {
        let cmd = this.cmdTracker.redo()
        if(cmd) {
            let elem = this.book.curPage.findElemById(cmd.o, true);
            switch (cmd.type) {
                case CmdType.Add:
                    this.scene.addElem(elem);break;
                case CmdType.Delete:
                    this.scene.removeElem(elem); break;
                case CmdType.Adjust:
                    this.adjustByCmd(cmd); break;
                default:
                    throw "command is not supported";
            }
            cmd.time = new Date().valueOf();
            this.wsClient.sendCmd(cmd);
        }
    }

    private handleCmdMessage(cmd:Cmd<any>) {
        switch (cmd.type) {
            case CmdType.Add: this.addElemByCmd(cmd); break;
            case CmdType.Delete: this.deleteElemByCmd(cmd); break;
            case CmdType.Adjust: this.adjustByCmd(cmd); break;
            case CmdType.Withdraw:
                const subCmd = DataLoader.load(Cmd, cmd.payload);
                this.undoCmd(subCmd);
                break;
            case CmdType.SwitchPage: //只读模式下，白板的创建者发出切换页面，其他人进行处理
                const res = JSON.parse(cmd.payload) as CmdPayloads[CmdType.SwitchPage]
                message.success("白板创建者正切换页面").then()
                this.switchPage(res.to); break;
            case CmdType.SwitchMode: //收到由创建者发出的切换模式
                const mode = Number.parseInt(cmd.payload) as BoardMode; //新模式
                this.onSwitchMode(mode);
        }
    }

    /**
     *  @param cmd 可以来自本地撤销栈，也可以来自远程
     */

    private deleteElemByCmd(cmd:Cmd<any>) {
        if(cmd.pageId === this.book.curPage.id) {
            let elem = this.book.curPage.findElemById(cmd.o);
            if(elem) this.scene.removeElem(elem);
        } else {
            this.book.deleteElemInPage(cmd.o, cmd.pageId);
        }
    }

    private addElemByCmd(cmd:Cmd<any>) {
        let elem;
        if(!cmd.payload) {
            elem = this.book.findElemInPage(cmd.o, true, cmd.pageId);
        } else {
            elem = loadElemByCmd(cmd);
        }
        this.book.addElemInPage(elem, cmd.pageId);
        if(cmd.pageId === this.book.curPage.id) this.scene.addElem(elem);
    }

    private adjustByCmd(cmd:Cmd<any>, backTrace:boolean = false) {
        let adjust = JSON.parse(cmd.payload) as CmdPayloads[CmdType.Adjust];
        this.book.adjustElemInPage(cmd.o, adjust, cmd.pageId, backTrace);
        if(cmd.pageId === this.book.curPage.id) {
            this.scene.refreshBackground();
        }
    }

    public switchPage(pageId:string) {
        // 先尝试从本地缓存读取
        if(this.book.switchPage(pageId)) {
            this.scene.renderPage(this.book.curPage);
        } else {
            let sCmd = new CmdBuilder<CmdType.LoadPage>()
                .setType(CmdType.LoadPage).setUser(UserManager.getId())
                .setPage(this.whiteBoard.id, pageId).build();
            this.wsClient.sendCmd(sCmd);
        }
        // 切换页面后注意取消选中和scene的激活元素
        (this.toolBox.getTool("selection") as Selection).unSelectedCurElem();
        this.scene.deactivateElem();
    }

    public async createPage(name:string, data?:string):Promise<Page[]> {
        let pages = await createPage(this.whiteBoard.id, name, data);
        const l = pages[pages.length - 1];
        message.success("创建白板成功，正在切换");
        this.book.addPage(l); this.book.switchPage(l.id);
        if(!data) this.scene.renderPage(this.book.curPage);
        return pages;
    }

    public setProps(prop: keyof ElementSum, value: any) {
        if(this.toolBox.curTool.type === "selection") {
            if((this.toolBox.curTool as Selection).setProp(prop, value))
                this.scene.render();
        } else {
            (this.toolBox.curTool as any)[prop] = value;
        }
    }

    public delete() {
        let elemToRm = this.scene.actElem;
        elemToRm.selected = false;
        this.toolBox.getTool("eraser").erase(elemToRm);
    }

}
