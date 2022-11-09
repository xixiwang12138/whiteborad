import {PathElement} from "./PathElement";
import {ElementType} from "./ElementBase";
import {RotateUtil} from "../../../../utils/math";


export class Line extends PathElement {

    public constructor(id:number, x:number, y:number) {
        super(id, x, y, ElementType.linear);
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

    public drawBeforeCtxRestore(ctx: CanvasRenderingContext2D) {
        super.drawBeforeCtxRestore(ctx);
        const l = this.strokeWidth * 4;
        const angle = 30 * Math.PI / 180;
        const p = this.points;
        let a = Math.atan2(p[3] - p[1], p[2] - p[0]);
        let a1x = p[2] - l * Math.cos(a + angle);
        let a1y = p[3] - l * Math.sin(a + angle);
        let a2x = p[2] - l * Math.cos(a - angle);
        let a2y = p[3] - l * Math.sin(a - angle);
        ctx.beginPath();
        ctx.moveTo(a1x, a1y);
        ctx.lineTo(p[2], p[3]);
        ctx.lineTo(a2x, a2y);
        ctx.stroke();
        ctx.closePath();
    }

}
