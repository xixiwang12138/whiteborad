import {DrawingScene, OnRenderListener} from "./DrawingScene";
import {ToolType} from "./tools/Tool";
import {ToolBox} from "./tools/ToolBox";
import {SecondLevelType} from "../components/ToolList";
import {GenericElementTool} from "./tools/GenericElementTool";
import {EllipseElement, GenericElement, GenericElementType, RectangleElement} from "./element/GenericElement";
import {LinearElementType, LinearTool} from "./tools/LinearTool";
import {TextTool} from "./tools/TextTool";
import {Cmd, CmdBuilder, CmdPayloads, CmdType, loadElemByCmd, Message} from "../ws/message";
import {Selection} from "./tools/Selection";
import {IWebsocket, WebsocketManager} from "../ws/websocketManager";
import {OperationTracker} from "./operationTracker/OperationTracker";
import {Page} from "./data/Page";
import {DataLoader} from "../../../utils/data/DataLoader";
import {WhiteBoard} from "./data/WhiteBoard";
import {UserManager} from "../../../UserManager";
import {ElementBase, ElementType} from "./element/ElementBase";
import {FreeDraw} from "./element/FreeDraw";
import {TextElement} from "./element/TextElement";
import {Arrow, Line} from "./element/Line";
import {message} from "antd";


export class WhiteBoardApp implements IWebsocket {

    public whiteBoard:WhiteBoard;

    private pages:Map<string, Page> = new Map<string, Page>();

    private wsClient:WebsocketManager;

    private readonly scene:DrawingScene;

    private toolBox: ToolBox;

    private cmdTracker:OperationTracker<Cmd<any>>;

    public onClose = () => {}

    public onOpen = () => {
        message.success("连接到远程白板").then();
    }

    public onError = () => {}

    public onMessage = (e:MessageEvent) => {
        const message = JSON.parse(e.data) as Message;
        switch (message.type) {
            case "load":
                let page = DataLoader.load(Page, message.data);
                this.pages[page.id] = page;
                this.scene._pageId = page.id;
                this.scene.renderPage(page);
                break;
            case "cmd":
                const cmd = DataLoader.load(Cmd, message.data);
                switch (cmd.type) {
                    case CmdType.Add:
                        let elem = loadElemByCmd(cmd);
                        console.log(elem);
                        let page = this.pages[cmd.pageId];
                        page.addElem(elem);
                        this.scene.addElem(elem);
                        break
                    case CmdType.Delete:
                        break
                }
        }
    }

    constructor(whiteBoard:WhiteBoard) {
        this.scene = new DrawingScene();
        this.toolBox  = new ToolBox();
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
            let cmd = new CmdBuilder<CmdType.Add>().setType(CmdType.Add)
                .setPage(this.whiteBoard.id, this.scene._pageId)
                .setUser(UserManager.getId()).setElement(e)
                .setPayload(e).build();
            this.cmdTracker.do(cmd);
            this.wsClient.sendCmd(cmd);
        })
        this.toolBox.addOnModifyListener(CmdType.Adjust, (t, e,p) => {
            let cmd = new CmdBuilder<CmdType.Adjust>().setType(CmdType.Adjust)
                .setPage(this.whiteBoard.id, this.scene._pageId)
                .setUser(UserManager.getId()).setElement(e)
                .setPayload(p).build();
            this.cmdTracker.do(cmd);
            this.wsClient.sendCmd(cmd);
        })
        this.toolBox.addOnModifyListener(CmdType.Delete, (t, e) => {
            let cmd = new CmdBuilder<CmdType.Delete>().setType(CmdType.Delete)
                .setPage(this.whiteBoard.id, this.scene._pageId)
                .setUser(UserManager.getId()).setElement(e).build();
            this.cmdTracker.do(cmd);
            this.wsClient.sendCmd(cmd);
        })
    }

    public setOnRenderListener(listener:OnRenderListener) {
        this.scene.onRender =  (c:DrawingScene) => {
            listener(c);
        }
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

    public dispatchMouseEvent(e:MouseEvent, doubleClick:boolean = false) {
        this.toolBox.curTool.op(this.scene.toSceneEvent(e, doubleClick), this.scene);
        // 使用完除了选择工具之后，切换回选择工具
        if(e.type === "mouseup" && this.toolBox.curTool.type !== "selection" && this.toolBox.curTool.type !== "eraser") {
            this.toolBox.setCurTool("selection");
        }
    }

    public refreshScene() {
        this.scene.render();
    }

    // 返回是否成功缩放
    public zoomScene(dScale:number, sx:number, sy:number):boolean {
        if((dScale < 0 && this.scene.scale >= 0.2) || (dScale > 0 && this.scene.scale <= 2)) {
            this.scene.zoom(dScale, sx, sy);
            return true;
        }
        return false;
    }

    public translateScene(dx:number, dy:number) {
        this.scene.translate(dx, dy);
    }

    public undo() {
        let cmd = this.cmdTracker.undo();
        if(cmd) {
            switch (cmd.type) {
                case CmdType.Add:
                case CmdType.Delete:
                    this.reverseElemExist(cmd.pageId, cmd.o); break;
                case CmdType.Adjust:
                    let adjust  = JSON.parse(cmd.payload) as CmdPayloads[CmdType.Adjust];
                    this.updateElemState(cmd.pageId, cmd.o, adjust, true); break;
                default:
                    throw "command is not supported";
            }
            let wdCmd = new CmdBuilder<CmdType.Withdraw>()
                .setType(CmdType.Withdraw)
                .setUser(UserManager.getId())
                .setPage(cmd.boardId,cmd.pageId)
                .setPayload(cmd)
                .build()
            this.wsClient.sendCmd(wdCmd);
        }
    }

    public redo() {
        let cmd = this.cmdTracker.redo();
        if(cmd) {
            switch (cmd.type) {
                case CmdType.Add:
                case CmdType.Delete:
                    this.reverseElemExist(cmd.pageId, cmd.o); break;
                case CmdType.Adjust:
                    let adjust  = JSON.parse(cmd.payload) as CmdPayloads[CmdType.Adjust];
                    this.updateElemState(cmd.pageId, cmd.o, adjust, true); break;
                default:
                    throw "command is not supported";
            }
            cmd.time = new Date().valueOf();
            this.wsClient.sendCmd(cmd);
        }
    }

    /**
     *  反转元素的存在状态
     */
    private reverseElemExist(pageId:string, elemId:string) {
        let elem = this.pages.get(pageId).findElemById(elemId, true);
        if(elem) {
            if(elem.isDeleted) {
                elem.isDeleted = false;
                if(this.scene.pageId === pageId) this.scene.restoreElem(elemId);
            } else {
                elem.isDeleted = true;
                if(this.scene.pageId === pageId) this.scene.refreshBackground();
            }
        }
    }

    private updateElemState(pageId:string, elemId:string, adjust:CmdPayloads[CmdType.Adjust], backTrace:boolean = false) {
        this.pages.get(pageId).updateElemStateById(elemId, adjust, backTrace);
        if(this.scene.pageId === pageId) this.scene.refreshBackground();
    }


}