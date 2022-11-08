import {DrawingScene, OnRenderListener} from "./DrawingScene";
import {ToolType} from "./tools/Tool";
import {SceneTouchEvent, SceneTouchEventType} from "./element/TouchEvent";
import {ToolBox} from "./tools/ToolBox";
import {SecondLevelType} from "../components/ToolList";
import {GenericElementTool} from "./tools/GenericElementTool";
import {GenericElementType} from "./element/GenericElement";
import {LinearElementType, LinearTool} from "./tools/LinearTool";
import {ElementType} from "./element/ElementBase";
import {TextTool} from "./tools/TextTool";



export class WhiteBoardApp {

    private readonly scene:DrawingScene;

    public toolBox: ToolBox;

    constructor() {
        this.scene = new DrawingScene();
        this.toolBox  = new ToolBox();
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
        // 文本工具特殊处理
        if(this.scene.actElem?.type === ElementType.text) {
            if(!this.scene.actElem.finish) {
                (this.toolBox.getTool("text") as TextTool).closeEditor();
                this.scene.actElem.finish = true;
                if(!this.scene.getElem(this.scene.actElem.id)) this.scene.addElem(this.scene.actElem);
                this.scene.actElem = null;
                this.scene.render();
            }
        }
        this.scene.unSelectAll();
    }

    public dispatchMouseEvent(e:MouseEvent, doubleClick:boolean = false) {
        this.toolBox.curTool.op(this.translateSceneEvent(e, doubleClick), this.scene);
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

    /**
     *  将原生触摸事件转化成场景事件
     */
    private translateSceneEvent(e:MouseEvent, doubleClick:boolean):SceneTouchEvent {
        if(doubleClick) {
            return new SceneTouchEvent("doubleClick",
                (e.x - this.scene.x) / this.scene.scale,
                (e.y -this.scene.y) / this.scene.scale, e.x, e.y);
        }
        return new SceneTouchEvent(e.type.slice(5) as SceneTouchEventType,
            (e.x - this.scene.x) / this.scene.scale,
            (e.y -this.scene.y) / this.scene.scale, e.x, e.y);
    }

}