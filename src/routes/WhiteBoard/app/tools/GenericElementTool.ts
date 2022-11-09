import {GenericElement, GenericElementType} from "../element/GenericElement";
import {GenericDrawingTool} from "./GenericDrawingTool";
import {DrawingScene} from "../DrawingScene";
import {SceneTouchEvent} from "../element/TouchEvent";

export class GenericElementTool extends GenericDrawingTool {

    private _shape:GenericElementType = "rectangle";
    set shape(s:GenericElementType){this._shape = s};

    public constructor() {
        super("generic");
    }

    protected effective(scene: DrawingScene): boolean {
        return scene.actElem!.width > 2 && scene.actElem!.height > 2;
    }

    protected onDown(e: SceneTouchEvent, scene: DrawingScene) {
        this.last.x = e.x; this.last.y = e.y;
        scene.actElem = GenericElement.newGenericElement(
            this._shape, new Date().valueOf(), e.x, e.y);
    }


}