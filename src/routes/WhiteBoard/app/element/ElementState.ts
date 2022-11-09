import {ElementBase} from "./ElementBase";


export class ElementState<T extends ElementBase> {

    public x:number;
    public y:number;
    public width:number;
    public height:number;
    public angle:number;

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

    public analyseDiff(e:T):Record<string, any> | null {
        let res:Record<string, any> = {}
        let flag = false;
        ["x", "y", "angle", "width", "height"].forEach((k) => {
            if((this as any)[k] !== (e as any)[k]) {
                res[k] = (e as any)[k];
                flag = true;
            }
        })
        return flag ? res : null;
    }


}