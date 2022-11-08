
import {ElementBase, ElementType} from "./ElementBase";
import {ScaleUtil} from "../../../../utils/math";

/**
 * 由点阵构成的路径抽象元素，比如直线，箭头，自由绘制
 */
export abstract class PathElement extends ElementBase {

    public points: Array<number>;

    public _points!: Array<number>;

    protected constructor(id:number, x:number, y:number, type:ElementType) {
        super(id, x, y, type);
        this.points = new Array<number>(2);
        this.points[0] = x; this.points[1] = y;
    }

    public drawBeforeCtxRestore(ctx: CanvasRenderingContext2D) {
        const points = this.points;
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        const bound = points.length / 2;
        const b = bound > 2;
        for(let i = 1;i < bound;i++) {
            const endX = (points[2 * (i - 1)] + points[2 * i]) / 2;
            const endY = (points[2 * (i - 1) + 1] + points[2 * i + 1]) / 2;
            if(b) {
                ctx.quadraticCurveTo(points[2 * (i - 1)], points[2 * (i - 1) + 1], endX, endY);// 贝塞尔曲线
            } else {
                ctx.lineTo(points[2 * i], points[2 * i + 1])
            }
        }
        ctx.stroke();
    }


    public move(dx: number, dy: number) {
        super.move(dx, dy);
        const points = this.points;
        const bound = points.length / 2;
        for(let i = 0;i < bound;i++) {
            points[2 * i] += dx; points[2 * i + 1] += dy;
        }
    }

    public scale(factorH: number, factorV: number) {
        super.scale(factorH, factorV);
        const center = this.getCenter();
        [...this.points] = this._points;
        ScaleUtil.scalePoints(this.points, factorH, factorV, center.x, center.y);
    }

    public onScaleStart() {
        super.onScaleStart();
        [...this._points] = this.points; // 深拷贝数组
    }
}