import {PathElement} from "./PathElement";
import {ElementType} from "./ElementBase";
import {RotateUtil} from "../../../../utils/math";
import {CanvasScaledCtx} from "../DrawingScene";
import {field} from "../../../../utils/data/DataLoader";
import {LinearElementType} from "../tools/LinearTool";


export class Line extends PathElement {

    @field(String)
    public linearType:LinearElementType;

    public constructor(id:string = "", x:number = 0, y:number = 0, type:LinearElementType = "line") {
        super(id, x, y, ElementType.linear);
        this.linearType = type;
        this.points.push(null!, null!);
    }

    public drawTo(x:number, y:number) {
        if(x > this.points[0]) {
            this.width = x - this.points[0];
            this.x = this.points[0];
        } else {
            this.width = this.points[0] - x;
            this.x = x;
        }
        this.points[2] = x; this.points[3] = y;
        if(y > this.points[1]) {
            this.height = y - this.points[1];
            this.y = this.points[1];
        } else {
            this.height = this.points[1] - y;
            this.y = y;
        }
    }

    public inPreciseRange(x: number, y: number, radius: number): boolean {
        const center = this.getCenter();
        const noRotated = RotateUtil.rotate(x, y, center.x, center.y, -this.angle);
        // 求直线方程
        const A = this.points[3] - this.points[1];
        const B = this.points[0] - this.points[2];
        const C = this.points[2] * this.points[1] - this.points[0] * this.points[3];
        return Math.pow(A*noRotated[0] + B*noRotated[1] + C, 2) / (A * A + B * B) <= radius * radius;
    }

}

export class Arrow extends Line {

    constructor(id:string = "", x:number = 0, y:number = 0) {
        super(id, x, y, "arrow");
    }

    public drawBeforeCtxRestore(ctx: CanvasScaledCtx): void {
        super.drawBeforeCtxRestore(ctx);
        const l = this.strokeWidth * 4 * ctx._scale;
        const angle = 30 * Math.PI / 180;
        const p = this.points;
        let a = Math.atan2(p[3] - p[1], p[2] - p[0]);
        let c = [
            p[2] - l * Math.cos(a + angle),
            p[3] - l * Math.sin(a + angle),
            p[2],
            p[3],
            p[2] - l * Math.cos(a - angle),
            p[3] - l * Math.sin(a - angle)
        ].map(t => t*ctx._scale);
        ctx.beginPath();
        ctx.moveTo(c[0], c[1]);
        ctx.lineTo(c[2], c[3]);
        ctx.lineTo(c[4], c[5]);
        ctx.stroke();
        ctx.closePath();
    }

}
