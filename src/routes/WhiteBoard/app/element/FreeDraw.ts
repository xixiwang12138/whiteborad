import {ElementType} from "./ElementBase";
import {PathElement} from "./PathElement";
import {RotateUtil} from "../../../../utils/math";


export class FreeDraw extends PathElement {

    public constructor(id:string = "", x:number = 0, y:number = 0) {
        super(id, x, y, ElementType.freedraw);
    }

    public drawTo(x:number, y:number) {
        this.points.push(x, y);
        this.updateSpaceState(x, y);
    }

    private updateSpaceState(tx: number, ty: number)  {
        // 小于左边界
        if(tx < this.x){
            this.width = this.x + this.width - tx;
            this.x = tx;
            // this.width = this.x + this.width / 2 - tx;
            // this.x = tx + this.width / 2;
        }
        // 小于上边界
        if(ty < this.y) {
            this.height = this.y + this.height - ty;
            this.y = ty;
            // this.height = this.y + this.height / 2 - ty;
            // this.y = ty + this.height / 2;
        }
        // 大于右边界
        if(tx > this.x + this.width) {
            this.width = tx - this.x;
            // this.width = tx - (this.x - this.width / 2);
            // this.x = tx - this.width / 2;
        }
        // 大于下边界
        if(ty > this.y + this.height) {
            this.height = ty - this.y;
            // this.height = ty - (this.y - this.height / 2);
            // this.y = ty - this.height / 2;
        }
    }


    public inPreciseRange(x: number, y: number, radius:number): boolean {
        if(!this.inRectRange(x, y)) return false;
        const center = this.getCenter();
        const noRotated = RotateUtil.rotate(x, y, center.x, center.y, -this.angle);
        let bound = this.points.length / 2;
        for(let i = 0;i < bound;i++) {
            const d = Math.pow(noRotated[0] - this.points[2 * i], 2) +
                Math.pow(noRotated[1] - this.points[2 * i + 1], 2);
            if(d < radius * radius) return true;
        }
        return false;
    }
}