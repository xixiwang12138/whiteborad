import {ElementBase} from "./ElementBase";
import {CmdPayloads, CmdType} from "../../ws/message";


export class ElementState<T extends ElementBase> {

    public x:number;
    public y:number;
    public width:number;
    public height:number;
    public angle:number;
    public fontSize:number; // text
    public points:number[]; // path

    constructor(e:T) {
        this.x = e.x;
        this.y = e.y;
        this.width = e.width;
        this.height = e.height;
        this.angle = e.angle;
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
        ["x", "y", "angle", "width", "height", "fontSize", "points"].forEach((k) => {
            if(this[k] !== e[k]) {
                res[k] = [this[k] ,e[k]];
                flag = true;
            }
        })
        return flag ? res : null;
    }


}