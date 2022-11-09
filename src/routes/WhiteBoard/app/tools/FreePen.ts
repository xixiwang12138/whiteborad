import {Point, Tool, ToolType} from "../tools/Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";
import {FreeDraw} from "../element/FreeDraw";
import {GenericDrawingTool} from "./GenericDrawingTool";
import {IdGenerator} from "../../../../utils/IdGenerator";

export class FreePen extends GenericDrawingTool {

    constructor() {
        super("freePen");
    }

    protected effective(scene: DrawingScene): boolean {
        return (scene.actElem as FreeDraw).points.length > 2;
    }

    protected onDown(e: SceneTouchEvent, scene: DrawingScene) {
        this.last.x = e.x; this.last.y = e.y;
        scene.actElem = new FreeDraw(IdGenerator.genElementId(), e.x, e.y);
    }


}