import {Tool, ToolType} from "./Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../../app/DrawingScene";

export class Eraser extends Tool {

    public constructor() {
        super("eraser");
    }
    public op(e: SceneTouchEvent, scene: DrawingScene) {
        if(e.type === "down" || e.type === "move") {
            let elem = scene.findElemByEvent(e);
            if(elem){
                scene.removeElem(elem);
            }
        }
    }
}