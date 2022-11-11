import {Creator, Modifier, OnCreate, OnModify, Tool, ToolType} from "../tools/Tool";
import {Selection} from "./Selection";
import {FreePen} from "./FreePen";
import {TextTool} from "./TextTool";
import {GenericElementTool} from "./GenericElementTool";
import {LinearTool} from "./LinearTool";
import {Eraser} from "./Eraser";
import {CmdPayloads, CmdType} from "../../ws/message";

export type CursorStyle = "default" | "grab" | "move" | "se-resize" | "cell" | "crosshair" | "text";

export class ToolBox {

    private currentCursor:CursorStyle = "default";

    private tools:Map<ToolType, Tool>;

    private _curTool:Tool;

    get curTool(){return this._curTool;}

    public constructor() {
        this.tools = new Map<ToolType, Tool>();
        this.initTools();
        this._curTool = this.tools.get("selection")!;
    }

    private initTools() {
        [new Selection(), new FreePen(), new TextTool(), new GenericElementTool(),
            new LinearTool(), new Eraser()].forEach((t) => {
                this.addTool(t);
        })
    }

    private addTool(tool:Tool) {
        this.tools.set(tool.type, tool);
        tool.setToolBox(this);
        if("onModify" in tool) {
            (tool as Modifier<any>).setOnModifyListener((t, e, p)=>{
                this.onModify.get(t)!(t, e, p);
            });
        }
        if("onCreate"in tool) {
            (tool as Creator).setOnCreateListener((e)=>{
                this.onCreate(e);
            });
        }
    }

    public setCurTool(type:ToolType) {
        this._curTool = this.tools.get(type)!;
        switch (type) {
            case "generic": this.changeCursorStyle("crosshair"); break;
            case "selection": this.changeCursorStyle("default"); break;
            case "linear": this.changeCursorStyle("crosshair"); break;
            case "text": this.changeCursorStyle("text"); break;
            case "eraser" : this.changeCursorStyle("cell"); break;
        }
    }

    public getTool(type:ToolType) {
        return this.tools.get(type);
    }

    onCreate:OnCreate = () => {};

    onModify:Map<CmdType, OnModify<any>>
        = new Map<CmdType, OnModify<any>>();

    public setOnCreateListener(l: OnCreate): void {
        this.onCreate = l;
    }

    public addOnModifyListener<T extends Exclude<keyof CmdPayloads, CmdType.Add>>(t:T, f: OnModify<T>): void {
        this.onModify.set(t, f);
    }

    public changeCursorStyle(style:CursorStyle) {
        if(this.currentCursor !== style) {
            document.getElementById("canvas-root").style.cursor = style;
            this.currentCursor = style;
        }
    }

}