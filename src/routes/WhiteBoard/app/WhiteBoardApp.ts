import {DrawingScene, OnRenderListener} from "./DrawingScene";
import {ToolType} from "./tools/Tool";
import {ToolBox} from "./tools/ToolBox";
import {SecondLevelType} from "../components/ToolList";
import {GenericElementTool} from "./tools/GenericElementTool";
import {GenericElementType} from "./element/GenericElement";
import {LinearElementType, LinearTool} from "./tools/LinearTool";
import {TextTool} from "./tools/TextTool";
import {Cmd, CmdBuilder, CmdPayloads, CmdType, Message} from "../ws/message";
import {Selection} from "./tools/Selection";
import {IWebsocket, WebsocketManager} from "../ws/websocketManager";
import {OperationTracker} from "./operationTracker/OperationTracker";
import {Page} from "./data/Page";
import {DataLoader} from "../../../utils/data/DataLoader";
import {WhiteBoard} from "./data/WhiteBoard";
import {UserManager} from "../../../UserManager";


export class WhiteBoardApp implements IWebsocket {

    private whiteBoard:WhiteBoard;

    private pages:Map<string, Page> = new Map<string, Page>();

    private wsClient:WebsocketManager;

    private readonly scene:DrawingScene;

    private toolBox: ToolBox;

    private cmdTracker:OperationTracker<Cmd<keyof CmdPayloads>>;

    public onClose = () => {}

    public onOpen = () => {}

    public onError = () => {}

    public onMessage = (e:MessageEvent) => {
        const message = JSON.parse(e.data) as Message;
        switch (message.type) {
            case "load":
                let page = DataLoader.load(Page, message.data);
                this.pages[page.id] = page;
                this.scene.renderPage(page);
                break;
            case "cmd":
                const cmd = JSON.parse(message.data) as Cmd<any>;
                switch (cmd.type) { //TODO 完善处理方式
                    case CmdType.Add:
                        // this.scene.restoreElem()
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
        this.wsClient.connect(whiteBoard.id, UserManager.getId());
        this.cmdTracker = new OperationTracker<Cmd<keyof CmdPayloads>>(10);
        this.whiteBoard = whiteBoard;
        this.setupListeners();
    }

    private setupListeners() {
        this.toolBox.setOnCreateListener( (e) => {
            console.log(e);
        })
        this.toolBox.addOnModifyListener(CmdType.Adjust, (t, e,p) => {
            console.log(p);
        })
        this.toolBox.addOnModifyListener(CmdType.Delete, (t, e,p ) => {
            console.log(p);
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
                    this.deleteElem(cmd.pageId!, cmd.o!); break;
                case CmdType.Delete:
                    this.restoreElem(cmd.pageId!, cmd.o!); break;

            }
            let wdCmd = new CmdBuilder<CmdType.Withdraw>()
                .setType(CmdType.Withdraw)
                .setUser(123) // TODO 用户管理对象获取id
                .setPage(1,2)
                .setPayload(cmd)
                .build()
            this.wsClient.sendCmd(wdCmd);
        }
    }

    private deleteElem(pageId:number, elemId:string) {
        if(this.scene.pageId === pageId) {
            let elem = this.scene.getElem(elemId);
            if(elem) this.scene.removeElem(elem);
        }
        this.pages[pageId].deleteElemById(elemId);
    }

    private restoreElem(pageId:number, id:string) {
        const page = this.pages[pageId];
        let i = page.findElemIdxById(id, true);
        if(i !== -1) {
            page.elements[i].isDeleted = false;
            this.scene.restoreElem(id);
        }
    }

    public redo() {
        let cmd = this.cmdTracker.redo();
        if(cmd) {
            switch (cmd.type) {
                case CmdType.Add:

            }
        }
    }


}