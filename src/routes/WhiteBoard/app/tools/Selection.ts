import {Modifier, Point} from "./Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";
import {ElementBase, ElementType} from "../element/ElementBase";
import {RotateUtil} from "../../../../utils/math";
import {TextTool} from "./TextTool";
import {CmdType} from "../../ws/message";
import {ElementState} from "../element/ElementState";
import {TextElement} from "../element/TextElement";
import {PathElement} from "../element/PathElement";
import {ElementSum} from "../../components/WindowToolBar";
import {GenericElement} from "../element/GenericElement";


enum SelectionOperation {
    None, Moving, Rotating, Scaling
}

export type OnElemSelected = (e:ElementBase) => void;

export class Selection extends Modifier<CmdType.Adjust>{

    private selectionOp: SelectionOperation = SelectionOperation.None; // 选中元素后进行的操作

    protected last: Point = new Point(0, 0); // 上次点击位置

    private curSelectedElem:ElementBase | null = null;

    private oldState:ElementState<any> | null = null;

    public onElemSelected:OnElemSelected = () => {}

    constructor() {
        super("selection");
    }

    public op(e: SceneTouchEvent, scene: DrawingScene) {
        switch (e.type) {
            case "down":this.onDown(e, scene);break;
            case "move":this.onMove(e, scene);break;
            case "up":this.onUp(e, scene);break;
            case "doubleClick": this.onDoubleClick(e, scene);break;
            case "hover": this.onHover(e, scene);break;
        }
    }

    // 处理对文本的双击事件
    private onDoubleClick(e:SceneTouchEvent, scene:DrawingScene) {
        let cse = this.curSelectedElem;
        if(cse && cse.type === ElementType.text) {
            this.unSelectedCurElem(); // 取消选择，托管给文字工具，注意此时场景中的文字还是激活的
            let t = this.parent.getTool("text") as TextTool;
            [e.rawX, e.rawY] = scene.toRawXY(cse.x, cse.y);
            t.op(e, scene);
            scene.activate(t.curElem!);
        }
    }

    public unSelectedCurElem() {
        let cse = this.curSelectedElem;
        if(cse) {
            let change = this.oldState!.analyseDiff(this.curSelectedElem);
            if(change) this.onModify(CmdType.Adjust, cse, change)
            // 更新当前选中元素信息
            cse.selected = false;
            this.curSelectedElem = null; this.oldState = null;
        }
    }

    protected onDown(e: SceneTouchEvent, scene: DrawingScene) {
        this.last.x = e.x; this.last.y = e.y;
        let cse = this.curSelectedElem;
        if(cse) {
            if (cse.isRotateHandle(e.x, e.y)) {
                this.selectionOp = SelectionOperation.Rotating;
            } else if (cse.isScaleHandle(e.x, e.y)) {
                this.selectionOp = SelectionOperation.Scaling;
                cse.onScaleStart();
            } else if (!cse.inRectRange(e.x, e.y)) {
                // 当前有被选择元素但是不在范围内
                this.unSelectedCurElem(); // 由于双击后，文本元素托管给文本工具，所以如果有被选中元素一定不会是编辑中的文本元素
                // 更新场景中的元素信息
                scene.deactivateElem();
                // 并且选择工具选择了其他
                this.trySelectNewElem(e, scene);
            }
        } else {
            // 没有元素选中时，先考虑是否有文本工具在使用，如果在范围内就不选择新元素
            let textTool = (this.parent.getTool("text") as TextTool);
            if(textTool.curElem) {
                if(textTool.outOfBound(e)) {
                    if(textTool.finishEditing()) scene.deactivateElem();
                    else scene.dropActElem();
                    this.trySelectNewElem(e, scene);
                }
            } else {
                this.trySelectNewElem(e, scene);
            }
        }
    }

    private trySelectNewElem(e:SceneTouchEvent, scene:DrawingScene) {
        let elem = scene.findElemByEvent(e);
        if(elem) {
            elem.selected = true;
            this.curSelectedElem = elem;
            this.oldState = new ElementState(elem);
            // 针对不同元素保存不同状态
            if(elem instanceof TextElement) {
                this.oldState.fontSize = elem.fontSize;
                this.oldState.fontStyle = elem.fontStyle;
            }
            if(elem instanceof PathElement) this.oldState.points = [...(elem as PathElement).points];
            if(elem instanceof GenericElement) this.oldState.backgroundColor = elem.backgroundColor;
            scene.activate(elem);
            this.onElemSelected(elem);
        }
    }

    protected onMove(e: SceneTouchEvent, scene: DrawingScene) {
        if(this.selectionOp === SelectionOperation.Rotating) this.doRotation(e, scene.actElem!)
        else if(this.selectionOp === SelectionOperation.Scaling) this.doScaling(e, scene.actElem!);
        else this.doMoving(e, scene.actElem!);
        scene.render();
        this.last.x = e.x; this.last.y = e.y;
    }

    protected onUp(e: SceneTouchEvent, scene: DrawingScene) {
        this.selectionOp = SelectionOperation.None;
    }

    private onHover(e: SceneTouchEvent, scene: DrawingScene) {
        let cse = this.curSelectedElem;
        if(cse) {
            if (cse.isRotateHandle(e.x, e.y)) {
                this.parent.changeCursorStyle("grab");
            } else if (cse.isScaleHandle(e.x, e.y)) {
                this.parent.changeCursorStyle("se-resize");
            } else {
                this.parent.changeCursorStyle("default");
            }
        } else {
            let elem = scene.findElemByEvent(e);
            if (elem)
                this.parent.changeCursorStyle("move");
            else
                this.parent.changeCursorStyle("default");
        }
    }

    private doRotation(e:SceneTouchEvent, elem:ElementBase) {
        const center = elem.getCenter();
        let a1 = this.last.x - center.x, a2 = this.last.y - center.y;
        let b1 = e.x - center.x, b2 = e.y - center.y;
        let cos = (a1 * b2 - a2 * b1) / (Math.sqrt(a1*a1+a2*a2)*Math.sqrt(b1*b1+b2*b2));
        elem.rotate(Math.asin(cos));
    }

    private doScaling(e:SceneTouchEvent, elem:ElementBase) {
        const center = elem.getCenter();
        const noRotatedPoint = RotateUtil.rotate(e.x, e.y, center.x, center.y, -elem.angle);
        const fH = (noRotatedPoint[0] - center.x) / (elem._width / 2),
            fV = (noRotatedPoint[1] - center.y) / (elem._height / 2);
        elem.scale(fH, fV);
    }

    private doMoving(e:SceneTouchEvent, elem:ElementBase) {
        if(elem != null && elem.inRectRange(e.x, e.y)) {
            elem.move(e.x - this.last.x, e.y - this.last.y);
        }
    }

    /**
     *  如果当前有被选择元素，修改元素属性
     */
    public setProp(prop: keyof ElementSum, value: any):boolean {
        if(this.curSelectedElem) {
            (this.curSelectedElem as any)[prop] = value;
            if(this.curSelectedElem instanceof TextElement && (prop === "fontSize" || prop === "fontStyle")) {
                let size = this.scene.measureText(this.curSelectedElem);
                this.curSelectedElem.width = size.width;
                this.curSelectedElem.height = size.height;
            }
            return true;
        } else {
            return false;
        }
    }
}