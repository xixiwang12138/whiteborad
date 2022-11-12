import React from "react";
import "./index.css";
import BaseRow from "./components/BaseRow";
import ToolList, {IOpListener, SecondLevelType} from "./components/ToolList";
import WindowToolBar from "./components/WindowToolBar";
import {WhiteBoardApp} from "./app/WhiteBoardApp";
import {ToolType} from "./app/tools/Tool";
import {DrawingScene} from "./app/DrawingScene";
import {createPage, joinBoard} from "../../api/api";
import {RouteComponentProps} from "react-router-dom";
import {UserManager} from "../../UserManager";
import {message} from "antd";

import {Page} from "./app/data/Page";
import Widget, {IWidget, ScaleType} from "./components/Widget";

export interface WhiteBoardRouteParam {
    id:string
}

class WhiteBoard extends React.Component<RouteComponentProps<WhiteBoardRouteParam>> implements IOpListener, IWidget {
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
            name:"白板名字"
        },
        pages: [] as Partial<Page>[],
        memberList:[],
    }

    render() {
        return <div className="board">
            <BaseRow boardInfo={this.state.boardInfo} memberList={this.state.memberList}/>
            <Widget boardId={this.state.boardInfo.id} wCtrl={this} scale={this.state.scale}/>
            <ToolList onToolSelected={this.selectTool.bind(this)} opListener={this} />
            <div id="canvas-root" style={{width:"100%", height:"100%", overflow:"hidden"}}>
                <div id={"text-editor-container"}/>
                <canvas style={{width: "100%", height: "100%", backgroundColor:"#F2F0F1"}} id="show-canvas"/>
            </div>
            <WindowToolBar OnWinTypeSelected={(type)=>{console.log(type)}} />
        </div>
    }


    async componentDidMount() {
        this.setupCanvas();
        this.setupWindow();
        this.setupRootNode();
        await this.setupApp();
        await UserManager.syncUser();
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
        this.setState({
            boardInfo: {name:board.name, id:board.id},
            pages: board.pages,
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
                // eslint-disable-next-line array-callback-return
                let i = this.state.memberList.findIndex((v) => {if(v.id === m.id) return true});
                this.setState({
                    memberList: this.state.memberList.splice(i, 1)
                });
                message.info(`用户${m.name}离开`);
            }
        }
        this.app.translateScene((this.showCanvas.width - 1920) / 2, (this.showCanvas.height - 1080) / 2);
        this.app.refreshScene();
    }

    private onDown(e:MouseEvent) {
        // mousedown之后才捕捉move事件
        this.isMouseDown = true;
        if(this.refactoringScene) {
            this.lastX = e.x; this.lastY = e.y;
        } else {
            let newTime = new Date();
            if(newTime.valueOf() - this.lastTime.valueOf() < 300) {
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
        } else {
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

}


export default WhiteBoard;