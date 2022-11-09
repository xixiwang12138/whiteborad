import {ToolType} from "./Tool";
import {Arrow, Line} from "../element/Line";
import {GenericDrawingTool} from "./GenericDrawingTool";
import {DrawingScene} from "../DrawingScene";
import {SceneTouchEvent} from "../element/TouchEvent";
import {IdGenerator} from "../../../../utils/IdGenerator";

export type LinearElementType = "line" | "arrow";

export class LinearTool extends GenericDrawingTool {

    private _shape:LinearElementType = "line";
    set shape(s:LinearElementType){this._shape = s};

    public constructor() {
        super("linear");
    }

    protected effective(scene: DrawingScene): boolean {
        return scene.actElem!.width > 2 && scene.actElem!.height > 2;
    }

    protected onDown(e: SceneTouchEvent, scene: DrawingScene) {
        this.last.x = e.x; this.last.y = e.y;
        if(this._shape === "line")
            scene.actElem = new Line(IdGenerator.genElementId(), e.x, e.y);
         else
            scene.actElem = new Arrow(IdGenerator.genElementId(), e.x, e.y);
    }


}