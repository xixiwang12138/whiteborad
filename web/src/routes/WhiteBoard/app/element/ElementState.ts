import {ElementBase, ElementType} from "./ElementBase";
import {CmdPayloads, CmdType} from "../../ws/message";
import {FontStyle} from "../tools/TextTool";


export class ElementState<T extends ElementBase> {

    public x:number;
    public y:number;
    public width:number;
    public height:number;
    public angle:number;
    public opacity:number;
    public strokeColor:string;
    public strokeWidth:number;
    public fontSize:number; // text
    public fontStyle:FontStyle; // text
    public points:number[]; // path
    public backgroundColor:string; // generic

    constructor(e:T) {
        this.x = e.x;
        this.y = e.y;
        this.width = e.width;
        this.height = e.height;
        this.angle = e.angle;
        this.opacity = e.opacity;
        this.strokeColor = e.strokeColor;
        this.strokeWidth = e.strokeWidth;
    }

    // public isScaled(e:T):boolean {
    //     return e.width !== this.width || e.height !== this.height;
    // }
    //
    // public isMoved(e:T):boolean {
    //     return e.x !== this.x || e.y !== this.y;
    // }
    //
    // public isRotated(e:T):boolean {
    //     return e.angle !== this.angle;
    // }

    public analyseDiff(e:T):CmdPayloads[CmdType.Adjust] | null {
        let res:CmdPayloads[CmdType.Adjust] = {}
        let flag = false;
        ["x", "y", "angle", "width", "height", "fontSize", "fontStyle", "points", "opacity",
            "strokeColor", "backgroundColor", "strokeWidth"].forEach((k) => {
            if(this[k] !== e[k]) {
                res[k] = [this[k] ,e[k]];
                flag = true;
            }
        })
        return flag ? res : null;
    }


}