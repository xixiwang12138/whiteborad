import {ToolBox} from "./ToolBox";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";
import {ElementBase} from "../element/ElementBase";
import {CmdPayloads, CmdType} from "../../ws/message";

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

export type OnCreate = (e:ElementBase) => void;

export interface ICreator {
    onCreate:OnCreate
    setOnCreateListener(l:OnCreate):void
}

export abstract class Creator extends Tool implements ICreator {
    onCreate:OnCreate = (e:ElementBase) => {}
    public setOnCreateListener(l:OnCreate):void {
        this.onCreate = l;
    }
}


export type OnModify<T extends Exclude<keyof CmdPayloads, CmdType.Add>> = (cmd:T, e:ElementBase, payload:CmdPayloads[T]) => void;

export interface IModifier<T extends Exclude<keyof CmdPayloads, CmdType.Add>> {
    onModify:OnModify<T>;
    setOnModifyListener(l:OnModify<T>):void
}

export abstract class Modifier<T extends Exclude<keyof CmdPayloads, CmdType.Add>> extends Tool implements IModifier<T> {
    onModify:OnModify<T> = ( c, e,p) => {}
    public setOnModifyListener(l:OnModify<T>):void {
        this.onModify = l;
    }
}