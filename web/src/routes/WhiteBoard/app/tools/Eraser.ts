import {Modifier} from "./Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";
import {CmdType} from "../../ws/message";
import {ElementBase} from "../element/ElementBase";

export class Eraser extends Modifier<CmdType.Delete> {

    public constructor() {
        super("eraser");
    }

    public op(e: SceneTouchEvent, scene: DrawingScene) {
        if(e.type === "down" || e.type === "move") {
            let elem = scene.findElemByEvent(e);
            if(elem){
                scene.removeElem(elem);
                this.onModify(CmdType.Delete, elem, null); // 不发送原对象
            }
        }
    }

    public erase(elem:ElementBase) {
        if(elem.id !== this.scene.actElem.id) return;
        this.scene.deactivateElem();
        this.scene.removeElem(elem);
        this.onModify(CmdType.Delete, elem, null); // 不发送原对象
    }
}