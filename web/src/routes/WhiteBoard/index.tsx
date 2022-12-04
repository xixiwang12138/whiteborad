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
import {InteractEvent, MouseInteractEvent, NewInteractEvent, TouchInteractEvent} from "./app/event/InteractEvent";

export interface WhiteBoardRouteParam {
    id:string
}

export enum BoardMode {
    Editable,
    ReadOnly
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
        pages: [] as Page[],
        memberList:[],
        toolOrElemType: ElementType.none,

        undoAble:false,
        redoAble:false,

        mode: BoardMode.Editable,

        curPageId: "", // 为了给baseRow的导出功能提供id
        curPageIdx: 0, // 为了widget能够获得当前页面
    }

    render() {
        return <div className="board">
            <BaseRow curPageId={this.state.curPageId} boardInfo={this.state.boardInfo} memberList={this.state.memberList}
                     mode={this.state.mode} setMode={this.onSwitchMode.bind(this)} onUploadPage={this.onCreatePage.bind(this)}/>
            <Widget pages={this.state.pages} curPageIdx={this.state.curPageIdx} boardId={this.state.boardInfo.id}
                    wCtrl={this} scale={this.state.scale} mode={this.state.mode}/>
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
        this.selectTool("translation");
    }

    private setupCanvas() {
        this.showCanvas = document.getElementById("show-canvas") as HTMLCanvasElement;
        this.showCanvas.width = this.showCanvas.clientWidth * window.devicePixelRatio;
        this.showCanvas.height = this.showCanvas.clientHeight * window.devicePixelRatio;
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
        window.addEventListener("touchmove", function (e){
            e.preventDefault();
        }, {passive: false})
        window.onresize = this.onCanvasResize.bind(this);
    }

    private setupRootNode() {
        this.root = document.getElementById("canvas-root")!;
        // 判断是否为移动平台
        const isIPad = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0) || navigator.platform === 'iPad';
        const isAndroid = navigator.userAgent.indexOf("Mobile") > 1;
        if(isIPad || isAndroid) {
            this.root.ontouchstart = this.onDown.bind(this);
            this.root.ontouchend = this.onUp.bind(this);
            this.root.ontouchmove = this.onMove.bind(this);
        } else {
            this.root.onmousedown = this.onDown.bind(this);
            this.root.onmouseup = this.onUp.bind(this);
            this.root.onmousemove = this.onMove.bind(this);
        }
        this.root.addEventListener("wheel", (e) => {
            // 阻止默认全局缩放事件
            e.preventDefault();
            e.stopPropagation();
            if (this.refactoringScene) {
                this.onScale(Math.sign(e.deltaY) > 0 ? "small" : "enlarge", e.x, e.y);
            }}, {passive:false});
    }

    private async setupApp() {
        let board = await joinBoard(this.props.match.params.id);
        this.setState({curPageId:board.defaultPage})
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


    private onDown(eRaw:MouseEvent | TouchEvent) {
        let e = NewInteractEvent(eRaw);
        if(e.type !== "scalestart") {
            this.isMouseDown = true;
            if(this.refactoringScene) {
                this.lastX = e.x; this.lastY = e.y;
            } else {
                let newTime = new Date();
                if(newTime.valueOf() - this.lastTime.valueOf() < 300) {
                    e.type = "doubleClick";
                    this.app?.dispatchInteractEvent(e);
                    newTime.setFullYear(2000); // 设置一个足够久的时间，防止三连击
                } else {
                    this.app?.dispatchInteractEvent(e); // 双击时不触发down事件
                }
                this.lastTime = newTime;
            }
        }
    }

    private onUp(eRaw:MouseEvent | TouchEvent) {
        let e = NewInteractEvent(eRaw);
        if(e.type !== "scaleend") {
            if(!this.refactoringScene) {
                this.app?.dispatchInteractEvent(e);
            }
            this.isMouseDown = false;
        }
    }

    private onMove(eRaw:MouseEvent | TouchEvent) {
        let e = NewInteractEvent(eRaw);
        if(e.type === "scaling") {
            this.onScale((e as TouchInteractEvent).scaleType, e.x, e.y);
        } else {
            if(this.isMouseDown) {
                if(this.refactoringScene) {
                    this.app?.translateScene(e.x - this.lastX, e.y - this.lastY);
                    this.app?.refreshScene();
                    this.lastX = e.x; this.lastY = e.y;
                } else {
                    this.app?.dispatchInteractEvent(e);
                }
            } else {
                if(!this.refactoringScene) {
                    e.type = "hover";
                    this.app?.dispatchInteractEvent(e);
                }
            }
        }
    }

    private onCanvasResize() {
        this.showCanvas.width = this.showCanvas.clientWidth * window.devicePixelRatio;
        this.showCanvas.height = this.showCanvas.clientHeight * window.devicePixelRatio;
        this.clearCanvas();
        this.app?.refreshScene();
    }

    private clearCanvas() {
        this.showCanvasCtx.clearRect(0,0,
            this.showCanvas.clientWidth * window.devicePixelRatio,
            this.showCanvas.clientHeight * window.devicePixelRatio);
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

    public async onCreatePage(name:string, data?:string) {
        let pages = await this.app.createPage(name, data);
        this.setState({ pages, curPageId:pages[pages.length - 1].id, curPageIdx:pages.length - 1});
    }

    public async onSwitchPage(pageId:string) {
        //判断是否在已读模式下
        if(this.state.mode === BoardMode.ReadOnly) {
            //如果不是创建者，不能切换页面
            if(this.state.boardInfo.creator !== UserManager.getId()) {
                message.warn("在只读模式下只有创建者可以切换页面");
                return;
            } else {
                let i = this.state.pages.findIndex((e)=>e.id === pageId);
                this.setState({curPageId:pageId, curPageIdx:i})
                this.app.creatorSwitchPage(pageId);
                return
            }
        }
        let i = this.state.pages.findIndex((e)=>e.id === pageId);
        this.setState({curPageId:pageId, curPageIdx:i})
        this.app.switchPage(pageId);
    }

    public onScale(t:ScaleType, sx = this.showCanvas.clientWidth * window.devicePixelRatio / 2,
                   sy = this.showCanvas.clientHeight * window.devicePixelRatio / 2):number {
        let res = this.app?.zoomScene(t === "enlarge" ? 0.05: -0.05,
            sx, sy);
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
        //调整组件
        this.setState({mode: mode})
        if(mode === BoardMode.ReadOnly) this.selectTool("translation");
        const modeString = mode === BoardMode.ReadOnly ? "只读模式" : "编辑模式";
        await message.info(`白板由创建者切换到${modeString}`)
    }
}


export default WhiteBoard;
