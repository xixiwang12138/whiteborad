import {Point, Tool} from "../../app/tools/Tool";
import {SceneTouchEvent} from "../../app/element/TouchEvent";
import {DrawingScene} from "../../app/DrawingScene";
import {ElementBase, ElementType} from "../element/ElementBase";
import {RotateUtil} from "../../../../utils/math";
import {TextTool} from "./TextTool";


enum SelectionOperation {
    None, Moving, Rotating, Scaling
}


export class Selection extends Tool {

    private selectionOp: SelectionOperation = SelectionOperation.None; // 选中元素后进行的操作

    protected last: Point = new Point(0, 0); // 上次点击位置

    constructor() {
        super("selection");
    }

    public op(e: SceneTouchEvent, scene: DrawingScene) {
        switch (e.type) {
            case "down":this.onDown(e, scene);break;
            case "move":this.onMove(e, scene);break;
            case "up":this.onUp(e, scene);break;
            case "doubleClick": this.onDoubleClick(e, scene);break;
        }
    }

    private onDoubleClick(e:SceneTouchEvent, scene:DrawingScene) {
        let elem = scene.findElemByEvent(e);
        if(elem && elem.type === ElementType.text) {
            let t = this.parent.getTool("text") as TextTool;
            scene.actElem = elem;
            scene.actElem.finish = false;
            e.rawX = scene.actElem.x; e.rawY = scene.actElem.y;
            t.op(e, scene);
        }
    }

    protected onDown(e: SceneTouchEvent, scene: DrawingScene) {
        this.last.x = e.x; this.last.y = e.y;
        let trySelectNewElem = () => {
            let elem = scene.findElemByEvent(e);
            if(elem !== null) {
                if(scene.actElem) scene.actElem.selected = false;
                elem.selected = true;
                scene.setBackgroundOf(elem);
                scene.actElem = elem;
                scene.render();
            }
        }
        if(scene.actElem == null) {
            trySelectNewElem();
        } else {
            if(scene.actElem.finish) {
                if(scene.actElem.isRotateHandle(e.x, e.y)) {
                    this.selectionOp = SelectionOperation.Rotating;
                } else if (scene.actElem.isScaleHandle(e.x, e.y)) {
                    this.selectionOp = SelectionOperation.Scaling;
                    scene.actElem.onScaleStart();
                } else if(!scene.actElem.inRectRange(e.x, e.y)) {
                    trySelectNewElem();
                }
            } else {
                // 使用选择工具按下时，如果激活元素未完成，完成并绘制到背景
                let textTool = this.parent.getTool("text") as TextTool;
                if(textTool.editing && textTool.outOfBound(e)) {
                    textTool.closeEditor();
                    scene.actElem.finish = true;
                    if(!scene.getElem(scene.actElem.id)) scene.addElem(scene.actElem);
                    scene.actElem = null;
                    scene.render();
                }

            }
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


}