import {Modifier, Point} from "./Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";
import {ElementBase, ElementType} from "../element/ElementBase";
import {RotateUtil} from "../../../../utils/math";
import {TextTool} from "./TextTool";
import {CmdType} from "../../ws/message";
import {ElementState} from "../element/ElementState";


enum SelectionOperation {
    None, Moving, Rotating, Scaling
}

export class Selection extends Modifier<CmdType.Adjust>{

    private selectionOp: SelectionOperation = SelectionOperation.None; // 选中元素后进行的操作

    protected last: Point = new Point(0, 0); // 上次点击位置

    private curSelectedElem:ElementBase | null = null;

    private oldState:ElementState<any> | null = null;

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
            // 对当前选择元素判断属性是否被修改，并逐一回调
            // if(this.oldState!.isScaled(cse))
            //     this.onModify(CmdType.Adjust, {
            //         factorH: cse.width / this.oldState!.width,
            //         factorV: cse.height / this.oldState!.height
            //     });
            // if(this.oldState!.isMoved(cse)) this.onModify(CmdType.Move, {x:cse.x, y:cse.y});
            // if(this.oldState!.isRotated(cse)) this.onModify(CmdType.Adjust, {p:"angle", value: cse.angle});
            let change = this.oldState!.analyseDiff(this.curSelectedElem);
            if(change) this.onModify(CmdType.Adjust, cse, change)
            // 更新当前选中元素信息
            cse.selected = false;
            this.curSelectedElem = null; this.oldState = null;
        }
    }

    /**
     *  1、
     */
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
            // if(elem instanceof TextElement) this.oldState.extra = [{key:"text", value:elem.text}];
            scene.activate(elem);
        }
    }
    // protected onDown(e: SceneTouchEvent, scene: DrawingScene) {
    //     this.last.x = e.x; this.last.y = e.y;
    //     let trySelectNewElem = () => {
    //         let elem = scene.findElemByEvent(e);
    //         if(elem !== null) {
    //             if(scene.actElem) scene.actElem.selected = false;
    //             elem.selected = true;
    //             scene.setBackgroundOf(elem);
    //             scene.actElem = elem;
    //             scene.render();
    //         }
    //     }
    //     if(this.curSelectedElem == null) {
    //         trySelectNewElem();
    //     } else {
    //         if(this.curSelectedElem = finish) {
    //             if(scene.actElem.isRotateHandle(e.x, e.y)) {
    //                 this.selectionOp = SelectionOperation.Rotating;
    //             } else if (scene.actElem.isScaleHandle(e.x, e.y)) {
    //                 this.selectionOp = SelectionOperation.Scaling;
    //                 scene.actElem.onScaleStart();
    //             } else if(!scene.actElem.inRectRange(e.x, e.y)) {
    //                 trySelectNewElem();
    //             }
    //         } else {
    //             // 使用选择工具按下时，如果激活元素未完成，完成并绘制到背景
    //             let textTool = this.parent.getTool("text") as TextTool;
    //             if(textTool.editing && textTool.outOfBound(e)) {
    //                 textTool.closeEditor();
    //                 scene.actElem.finish = true;
    //                 const empty = (scene.actElem as TextElement).text === ""
    //                 if(!scene.getElem(scene.actElem.id)) {
    //                     if(!empty) scene.addElem(scene.actElem);
    //                     scene.actElem = null;
    //                 } else {
    //                     if(empty) scene.removeElem(scene.actElem); // 如果修改之后为空，删除元素
    //                     else scene.unSelectAll();
    //                 }
    //
    //             }
    //
    //         }
    //     }
    // }

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