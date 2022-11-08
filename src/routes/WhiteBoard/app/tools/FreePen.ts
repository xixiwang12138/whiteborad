import {Point, Tool, ToolType} from "../tools/Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../../app/DrawingScene";
import {FreeDraw} from "../../app/element/FreeDraw";
import {GenericDrawingTool} from "./GenericDrawingTool";

export class FreePen extends GenericDrawingTool {

    constructor() {
        super("freePen");
    }

    protected effective(scene: DrawingScene): boolean {
        return (scene.actElem as FreeDraw).points.length > 2;
    }

    protected onDown(e: SceneTouchEvent, scene: DrawingScene) {
        this.last.x = e.x; this.last.y = e.y;
        scene.actElem = new FreeDraw(new Date().valueOf(), e.x, e.y);
    }


}