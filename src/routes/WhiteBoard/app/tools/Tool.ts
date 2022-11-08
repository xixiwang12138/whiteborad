import {ToolBox} from "./ToolBox";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";

export type ToolType = "translation" | "selection" |
    "eraser" | "freePen" | "text" | "generic" | "linear" | "image";

export class Point {
    x:number;
    y:number;
    constructor(x:number, y:number) {this.x = x; this.y = y;}
}

export abstract class Tool {

    public type:ToolType;

    protected parent!:ToolBox;

    protected constructor(type:ToolType) {this.type = type}

    public setToolBox(box:ToolBox) {
        this.parent = box;
    }

    public abstract op(e: SceneTouchEvent, scene: DrawingScene):void;


}