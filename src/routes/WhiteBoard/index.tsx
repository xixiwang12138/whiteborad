import React from "react";
import "./index.css";
import BaseRow from "./components/BaseRow";
import ToolList, {IOpListener, SecondLevelType} from "./components/ToolList";
import WindowToolBar, {ElementSum, ToolReactor} from "./components/WindowToolBar";
import {WhiteBoardApp} from "./app/WhiteBoardApp";
import {ToolType} from "./app/tools/Tool";
import {DrawingScene} from "./app/DrawingScene";
import {joinBoard, switchMode} from "../../api/api";
import {RouteComponentProps} from "react-router-dom";
import {UserManager} from "../../UserManager";
import {message} from "antd";

import {Page} from "./app/data/Page";
import Widget, {IWidget, ScaleType} from "./components/Widget";
import {ElementType} from "./app/element/ElementBase";

export interface WhiteBoardRouteParam {
    id:string
}

export enum BoardMode {
    ReadOnly,
    Editable
}

function toolElementTypeMapping(type:ToolType):ElementType {
    switch (type) {
        case "text": return ElementType.text;
        case "linear": return ElementType.linear;
        case "generic": return ElementType.generic;
        case "freePen": return ElementType.freedraw;
        default: return ElementType.none;
    }
}

class WhiteBoard extends React.Component<RouteComponentProps<WhiteBoardRouteParam>> implements IOpListener, IWidget, ToolReactor {
    private app!:WhiteBoardApp;

    private root!:HTMLElement;
    private showCanvas!:HTMLCanvasElement;
    private showCanvasCtx!:CanvasRenderingContext2D;

    // 鼠标位置信息
    private lastX:number = 0;
    private lastY:number = 0;
    private lastTime:Date = new Date();

    private refactoringScene:boolean = false; // 防止传播移动场景结束后的up事件也传播到工具去

    private isMouseDown = false;

    state = {
        boardInfo: {
            id: "白板id",
            name:"白板名字",
            creator: "创建者"
        },
        scale:1,
        pages: [] as Partial<Page>[],
        memberList:[],
        toolOrElemType: ElementType.none,

        undoAble:false,
        redoAble:false,

        mode: BoardMode.Editable,
    }

    render() {
        return <div className="board">
            <BaseRow boardInfo={this.state.boardInfo} memberList={this.state.memberList} mode={this.state.mode} setMode={this.onSwitchMode.bind(this)}/>
            <Widget boardId={this.state.boardInfo.id} wCtrl={this} scale={this.state.scale} mode={this.state.mode}/>
            <ToolList undoAble={this.state.undoAble} redoAble={this.state.redoAble}
                      onToolSelected={this.selectTool.bind(this)} opListener={this}  mode={this.state.mode}/>
            <div id="canvas-root" style={{width:"100%", height:"100%", overflow:"hidden"}}>
                <div id={"text-editor-container"}/>
                <canvas style={{width: "100%", height: "100%", backgroundColor:"#F2F0F1"}} id="show-canvas"/>
            </div>
            <WindowToolBar  propSetter={this} toolOrElemType={this.state.toolOrElemType} mode={this.state.mode}/>
        </div>
    }


    async componentDidMount() {
        await UserManager.syncUser();
        this.setupCanvas();
        this.setupWindow();
        this.setupRootNode();
        await this.setupApp();
    }

    private setupCanvas() {
        this.showCanvas = document.getElementById("show-canvas") as HTMLCanvasElement;
        this.showCanvas.width = this.showCanvas.clientWidth;
        this.showCanvas.height = this.showCanvas.clientHeight;
        this.showCanvasCtx = this.showCanvas.getContext('2d')!;
    }

    private setupWindow() {
        window.addEventListener("keydown", (e) => {
            if(e.key === "Control") {
                window.document.body.style.cursor = "move";
            }
        })
        window.addEventListener("keyup", (e)=> {
            if(e.key === "Control") {
                window.document.body.style.cursor = "default";
            }
        })
        window.onresize = this.onCanvasResize.bind(this);
    }

    private setupRootNode() {
        this.root = document.getElementById("canvas-root")!;
        this.root.onmousedown = this.onDown.bind(this);
        this.root.onmouseup = this.onUp.bind(this);
        this.root.onmousemove = this.onMove.bind(this);
        this.root.addEventListener("wheel", (e) => {
            // 阻止默认全局缩放事件
            e.preventDefault();
            e.stopPropagation();
            if (this.refactoringScene) {
                this.onScale(Math.sign(e.deltaY) > 0 ? "small" : "enlarge");
            }}, {passive:false});
    }

    private async setupApp() {
        let board = await joinBoard(this.props.match.params.id);
        console.log(board)
        this.setState({
            boardInfo: {name:board.name, id:board.id, creator: board.creator},
            pages: board.pages,
            mode: board.mode
        });
        this.app = new WhiteBoardApp(board);
        this.app.setup();
        this.app.setOnRenderListener(this.refreshShowCanvas.bind(this));
        this.app.onMember = (m, t) => {
            if(t === "enter") {
                this.setState({
                    memberList: [...this.state.memberList, {name:m.name, avatar:m.avatar}]
                });
                message.info(`用户${m.name}加入`);
            } else {
                let i = this.state.memberList.findIndex((v) => {if(v.id === m.id) return true});
                this.setState({
                    memberList: this.state.memberList.splice(i, 1)
                });
                message.info(`用户${m.name}离开`);
            }
        }
        this.app.setOnElemSelectedListener((e) => {
            this.setState({toolOrElemType: e.type})
        })
        this.app.cmdTracker.setOperableListener((o,a ) => {
            if(o === "redo") this.setState({redoAble:a});
            else this.setState({undoAble:a});
        })
        this.app.translateScene((this.showCanvas.width - 1920) / 2, (this.showCanvas.height - 1080) / 2);
        this.app.refreshScene();
        this.app.onSwitchMode = this.onSwitchMode.bind(this)
    }

    private onDown(e:MouseEvent) {
        // mousedown之后才捕捉move事件
        this.isMouseDown = true;
        if(this.refactoringScene) {
            this.lastX = e.x; this.lastY = e.y;
        } else {
            let newTime = new Date();
            if(newTime.valueOf() - this.lastTime.valueOf() < 400) {
                this.app?.dispatchMouseEvent(e, true, true);
                newTime.setFullYear(2000); // 设置一个足够久的时间，防止三连击
            } else {
                this.app?.dispatchMouseEvent(e, true); // 双击时不触发down事件
            }
            this.lastTime = newTime;
        }
    }

    private onUp(e:MouseEvent) {
        if(!this.refactoringScene) {
            this.app?.dispatchMouseEvent(e, false);
        }
        this.isMouseDown = false;
    }

    private onMove(e:MouseEvent) {
        if(this.isMouseDown) {
            if(this.refactoringScene) {
                this.app?.translateScene(e.x - this.lastX, e.y - this.lastY);
                this.app?.refreshScene();
                this.lastX = e.x; this.lastY = e.y;
            } else {
                this.app?.dispatchMouseEvent(e, true);
            }
        } else {
            if(!this.refactoringScene) {
                this.app?.dispatchMouseEvent(e, false);
            }
        }
    }

    private onCanvasResize() {
        this.showCanvas.width = this.showCanvas.clientWidth;
        this.showCanvas.height = this.showCanvas.clientHeight;
        this.clearCanvas();
        this.app?.refreshScene();
    }

    private clearCanvas() {
        this.showCanvasCtx.clearRect(0,0, this.showCanvas.clientWidth, this.showCanvas.clientHeight);
    }

    private refreshShowCanvas(s:DrawingScene) {
        this.clearCanvas();
        this.showCanvasCtx.save();
        this.showCanvasCtx.drawImage(s.realCvs, s.x,s.y);
        this.showCanvasCtx.restore();
    }

    private selectTool(type:ToolType, second?:SecondLevelType) {
        if(type === "translation") {
            this.refactoringScene = true;
            this.root.style.cursor = "grab";
            if(this.state.toolOrElemType !== ElementType.none) this.setState({toolOrElemType: ElementType.none});
        } else {
            this.setState({toolOrElemType: type});
            this.refactoringScene = false;
            this.app?.selectTool(type, second);
        }
    }

    onRedo(){this.app?.redo();}

    onUndo(){this.app?.undo();}

    public async onCreatePage(name:string):Promise<Page[]> {
        let pages = await this.app.createPage(name);
        this.setState({ pages });
        return pages;
    }

    public async onSwitchPage(pageId:string) {
        //判断是否在已读模式下
        if(this.state.mode === BoardMode.ReadOnly) {
            //如果不是创建者，不能切换页面
            if(this.state.boardInfo.creator !== UserManager.getId()) {
                message.warn("在只读模式下只有创建者可以切换页面")
            }
            return
        }
        this.app.switchPage(pageId);
    }

    public onScale(t:ScaleType):number {
        let res = this.app?.zoomScene(t === "enlarge" ? 0.05: -0.05,
            this.root.clientWidth / 2, this.root.clientHeight / 2);
        if(res !== -1) {
            this.app.refreshScene();
            this.setState({scale:res})
        }
        return res;
    }

    delete() {
        this.app.delete();
    }

    setProps(prop: keyof ElementSum, value: any) {
        this.app.setProps(prop, value);
    }


    public async onSwitchMode(mode: BoardMode) {
        const modeString = mode === BoardMode.ReadOnly ? "只读模式" : "编辑模式";
        await  message.info(`白板由创建者切换到${modeString}`)
        //调整组件
        this.setState({mode: mode})
    }
}


export default WhiteBoard;
