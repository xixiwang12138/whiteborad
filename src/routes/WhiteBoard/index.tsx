import React from "react";
import "./index.css";
import BaseRow from "./components/BaseRow";
import ToolList, {IOpListener, SecondLevelType} from "./components/ToolList";
import WindowToolBar from "./components/WindowToolBar";
import {WhiteBoardApp} from "./app/WhiteBoardApp";
import {ToolType} from "./app/tools/Tool";
import {DrawingScene} from "./app/DrawingScene";
import {joinBoard} from "../../api/api";
import {RouteComponentProps} from "react-router-dom";
import {UserManager} from "../../UserManager";


export interface WhiteBoardRouteParam {
    id:string
}

class WhiteBoard extends React.Component<RouteComponentProps<WhiteBoardRouteParam>> implements IOpListener {
    private app!:WhiteBoardApp;

    private root!:HTMLElement;
    private showCanvas!:HTMLCanvasElement;
    private showCanvasCtx!:CanvasRenderingContext2D;

    // 鼠标位置信息
    private lastX:number = 0;
    private lastY:number = 0;
    private lastTime:Date = new Date();

    private refactoringScene:boolean = false; // 防止传播移动场景结束后的up事件也传播到工具去

    render() {
        return <div className="board">
            <BaseRow />
            <ToolList onToolSelected={this.selectTool.bind(this)} opListener={this}/>
            <div id="canvas-root" style={{width:"100%", height:"100%", overflow:"hidden"}}>
                <div id={"text-editor-container"}/>
                <canvas style={{width: "100%", height: "100%", backgroundColor:"gray"}} id="show-canvas"/>
            </div>
            {/*<WindowToolBar OnWinToolSelected={this.selectTool.bind(this)} />*/}
        </div>
    }

    async componentDidMount() {
        this.setupCanvas();
        this.setupWindow();
        this.setupRootNode();
        await UserManager.syncUser();
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
        this.root.addEventListener("wheel", (e) => {
            // 阻止默认全局缩放事件
            e.preventDefault();
            e.stopPropagation();
            if (this.refactoringScene) {
                if(this.app?.zoomScene(-Math.sign(e.deltaY) * 0.05, e.x, e.y)){
                    this.app?.refreshScene();
                    // TODO UI同步到缩放按钮上
                }
            }}, {passive:false});
    }

    private async setupApp() {
        let boardId = this.props.match.params.id;
        this.app = new WhiteBoardApp(await joinBoard(boardId));
        this.app.setOnRenderListener(this.refreshShowCanvas.bind(this));
        this.app.translateScene((this.showCanvas.width - 1920) / 2, (this.showCanvas.height - 1080) / 2);
        this.app.refreshScene();
    }

    private onDown(e:MouseEvent) {
        // mousedown之后才捕捉move事件
        this.root.onmousemove = this.onMove.bind(this);
        if(this.refactoringScene) {
            this.lastX = e.x; this.lastY = e.y;
        } else {
            let newTime = new Date();
            if(newTime.valueOf() - this.lastTime.valueOf() < 400) {
                this.app?.dispatchMouseEvent(e, true);
                newTime.setFullYear(2000); // 设置一个足够久的时间，防止三连击
            } else {
                this.app?.dispatchMouseEvent(e); // 双击时不触发down事件
            }
            this.lastTime = newTime;
        }
    }

    private onUp(e:MouseEvent) {
        if(!this.refactoringScene) {
            this.app?.dispatchMouseEvent(e);
        }
        this.root.onmousemove = null;
    }

    private onMove(e:MouseEvent) {
        if(this.refactoringScene) {
            this.app?.translateScene(e.x - this.lastX, e.y - this.lastY);
            this.app?.refreshScene();
            this.lastX = e.x; this.lastY = e.y;
        } else {
            this.app?.dispatchMouseEvent(e);
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
        } else {
            this.refactoringScene = false;
            this.app?.selectTool(type, second);
        }
    }

    onRedo(): void {this.app?.redo();}

    onUndo(): void {this.app?.undo();}

}

// function WhiteBoard() {
//     return (
//         <div className="board">
//             <BaseRow />
//             <ToolList onToolSelected={(e,a)=>{console.log(e,a)}}/>
//             {/*<WindowInvite />*/}
//             <WindowToolBar />
//         </div>
//     )
// }

export default WhiteBoard;