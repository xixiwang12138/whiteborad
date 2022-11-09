import {Tool, ToolType} from "../tools/Tool";
import {Selection} from "../tools/Selection";
import {FreePen} from "../tools/FreePen";
import {TextTool} from "../tools/TextTool";
import {GenericElementTool} from "../tools/GenericElementTool";
import {LinearTool} from "../tools/LinearTool";
import {Eraser} from "../tools/Eraser";

export class ToolBox {

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
    }

    public setCurTool(type:ToolType) {
        this._curTool = this.tools.get(type)!;
    }

    public getTool(type:ToolType) {
        return this.tools.get(type);
    }

}