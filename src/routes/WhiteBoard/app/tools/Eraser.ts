import {Modifier} from "./Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";
import {CmdType} from "../../ws/message";

export class Eraser extends Modifier<CmdType.Delete> {

    public constructor() {
        super("eraser");
    }

    public op(e: SceneTouchEvent, scene: DrawingScene) {
        if(e.type === "down" || e.type === "move") {
            let elem = scene.findElemByEvent(e);
            if(elem){
                scene.removeElem(elem);
                this.onModify(CmdType.Delete, null!, elem.id); // 不发送原对象
            }
        }
    }
}