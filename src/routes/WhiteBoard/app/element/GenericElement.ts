import {ElementBase, ElementType} from "./ElementBase";
import {RotateUtil} from "../../../../utils/math";
import {CanvasScaledCtx} from "../DrawingScene";

export type GenericElementType = "rectangle" | "ellipse" | "triangle";

export class GenericElement extends ElementBase {

    public genericType:GenericElementType;

    private readonly startX:number;
    private readonly startY:number;

    public constructor(id:string, x:number, y:number, type:GenericElementType) {
        super(id, x, y, ElementType.generic);
        this.startX = x; this.startY = y;
        this.genericType = type;
    }

    public drawTo(x:number, y:number) {
        if(x < this.startX) {
            this.x = x;
            this.width = this.startX - x;
        } else {
            this.width = x - this.startX;
        }
        if(y < this.startY) {
            this.y = y;
            this.height = this.startY - y;
        } else {
            this.height = y - this.startY;
        }
    }

    public static newGenericElement(type:GenericElementType, id:string, x:number, y:number) {
        switch (type) {
            case "rectangle":
                return new RectangleElement(id, x, y);
            case "ellipse":
                return new EllipseElement(id, x, y);
            default:
                return null;
        }
    }

}

export class RectangleElement extends GenericElement {

    public constructor(id:string, x:number, y:number) {
        super(id, x, y, "rectangle");
    }

    public drawBeforeCtxRestore(ctx: CanvasScaledCtx): void {
        const s = ctx._scale;
        ctx.strokeRect(this.x * s, this.y * s, this.width * s, this.height * s);
        ctx.fillRect(this.x * s, this.y * s, this.width * s, this.height * s);
    }

}

export class EllipseElement extends GenericElement {

    public constructor(id:string, x:number, y:number) {
        super(id, x, y, "ellipse");
    }

    public drawBeforeCtxRestore(ctx: CanvasScaledCtx): void {
        const center = this.getCenter();
        center.x = center.x * ctx._scale; center.y = center.y * ctx._scale;
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, (this.width / 2) * ctx._scale, (this.height / 2) * ctx._scale,
            0, 0, 360);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }


    public inPreciseRange(x: number, y: number, radius: number): boolean {
        if(!this.inRectRange(x, y)) return false;
        const center = this.getCenter();
        const noRotated = RotateUtil.rotate(x, y, center.x, center.y, -this.angle);
        noRotated[0] -= center.x; noRotated[1] -= center.y; // 变换坐标轴
        const a2 = Math.pow(this.width / 2, 2),
            b2 = Math.pow(this.height / 2, 2), // 椭圆参数
            x2 = noRotated[0] * noRotated[0], y2 = noRotated[1] * noRotated[1];
        const dP = Math.sqrt(x2 + y2); // 该点到椭圆中心距离
        const dE = Math.sqrt(a2*b2*(x2+y2) / (a2*y2+x2*b2));// 该点与中心交点形成直线，与椭圆的交点到中心的距离
        return dP - dE < radius;
    }
}