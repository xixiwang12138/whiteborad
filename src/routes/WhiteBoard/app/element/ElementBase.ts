import {RotateUtil, ScaleUtil} from "../../../../utils/math";
import {SceneTouchEvent} from "./TouchEvent";
import {CanvasScaledCtx} from "../DrawingScene";
import {DataLoader, field, SerializableData} from "../../../../utils/data/DataLoader";


type OnselectedListener = (e: ElementBase) => void;

export enum ElementType {
    freedraw, text, generic, linear, none
}


export class ElementBase extends SerializableData {

    @field
    public id:string;
    @field(Number)
    public type:ElementType;
    @field
    public x:number; // 左上角点的x坐标
    @field
    public y:number;
    @field
    public width:number = 0;
    @field
    public height:number = 0;
    @field
    public angle:number = 0; // 弧度制
    @field
    public strokeColor:string = "#ff5656"; // 十六进制整数
    @field
    public strokeWidth:number = 5;
    @field
    public opacity:number = 1;
    @field
    public isDeleted:boolean = false;

    private onSelected!: OnselectedListener;

    public selected:boolean = false;
    // private corners:Array<number> = new Array<number>(8); // 被选中时的四个角定位点
    // private rotateHandle:Array<number> = new Array<number>(2); // 用于旋转的句柄的位置
    // public dirty = false; // 是否被修改

    // 缩放之前的长度和宽度
    public _width:number = 0;
    public _height:number = 0;

    private _finish:boolean = false;
    get finish(){return this._finish;}
    set finish(f){this._finish = f;}

    public constructor(id:string, x:number, y:number, type:ElementType) {
        super();
        this.id = id;
        this.x = x; this.y = y;
        this.type = type;
    }

    public setOnSelectedListener(listener:OnselectedListener) {
        this.onSelected = listener;
    }

    // private getCorners():number[] {
    //     return ;
    // }

    /**
     * 获取元素的中心点
     */
    public getCenter():{ x: number; y: number } {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        }
    }

    // 绘制选中边框
    public drawFrame(ctx:CanvasScaledCtx) {
        // 绘制边框，线宽度与scale无关
        const o = this.strokeWidth / 2 + 5;
        const corners = [this.x - o, this.y - o,
            this.x + this.width + o, this.y - o,
            this.x + this.width + o, this.y + this.height + o,
            this.x - o, this.y + this.height + o].map(c => c * ctx._scale);
        ctx.beginPath();
        ctx.moveTo(corners[0], corners[1]);
        ctx.setLineDash([5])
        for(let i = 1;i < 4;i++) ctx.lineTo(corners[2 * i], corners[2 * i + 1]);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([0])
    }

    // 绘制旋转句柄，圆圈大小与scale无关
    public drawRotateHandle(ctx:CanvasScaledCtx) {
        const x = (this.x + this.width / 2) * ctx._scale; const y = (this.y - this.strokeWidth / 2 - 20) * ctx._scale;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 360);
        ctx.closePath();
        ctx.stroke();
    }

    // 绘制缩放句柄
    public drawScaleHandle(ctx:CanvasScaledCtx) {
        ctx.beginPath();
        const o = this.strokeWidth / 2 + 5;
        const baseX = (this.x + this.width + o) * ctx._scale, baseY = (this.y + this.height + o) * ctx._scale;
        let points = [baseX, baseY,
            baseX + 8, baseY,
            baseX + 8, baseY + 8,
            baseX, baseY + 8
        ]
        ctx.moveTo(points[0], points[1]);
        for(let i = 1;i < 4;i++) ctx.lineTo(points[2 * i], points[2 * i + 1]);
        ctx.closePath();
        ctx.stroke();
    }

    public draw(ctx: CanvasScaledCtx) {
        const center = this.getCenter();
        center.x = center.x * ctx._scale; center.y = center.y * ctx._scale;
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(this.angle);
        ctx.translate(-center.x, -center.y);
        if(this.selected) {
            this.drawFrame(ctx); this.drawRotateHandle(ctx); this.drawScaleHandle(ctx);
        }
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth * ctx._scale;
        this.drawBeforeCtxRestore(ctx);
        ctx.restore();
    }

    // ctx恢复状态之前进行的绘制操作
    public drawBeforeCtxRestore(ctx: CanvasScaledCtx):void{};

    // 创建过程向某点绘制
    public drawTo(x:number, y:number):void{};

    public move(dx:number, dy:number) {
        this.x += dx; this.y += dy;
        // this.rotateHandle[0] += dx; this.rotateHandle[1] += dy;
        // for(let i = 0;i < 4;i++) {this.corners[2 * i] += dx; this.corners[2 * i + 1] += dy;}
    }

    public rotate(angle:number) {
        this.angle += angle;
        if(this.angle >= Math.PI * 2) this.angle -= Math.PI * 2;
        // RotateUtil.rotatePoints(this.rotateHandle, this.x, this.y, angle);
        // RotateUtil.rotatePoints(this.corners, this.x, this.y, angle);
    }

    // 绕中心点缩放
    public scale(factorH:number, factorV:number) {
        const center = this.getCenter();
        this.width = this._width * factorH;
        this.height = this._height * factorV;
        // 考虑缩放到镜像对称
        if(this.width <= 0) {
            this.x = center.x + this.width / 2;
            this.width = -this.width;
        }
        if(this.height <= 0) {
            this.y = center.y + this.height / 2;
            this.height = -this.height;
        }
        // 重新计算左上原点
        this.x = center.x - this.width / 2;
        this.y = center.y - this.height / 2;
        // this.genAnchors();
        // RotateUtil.rotatePoints(this.rotateHandle, this.x, this.y, this.angle);
        // RotateUtil.rotatePoints(this.corners, this.x, this.y, this.angle);
    }

    // 在缩放开始的时候把当前的长度和宽度保存起来
    public onScaleStart() {
        this._width = this.width;
        this._height = this.height;
    }

    // public finishCreation() {
    //     this.genAnchors();
    // }

    /**
     * 向该对象分派触摸事件，从而确定自己是否被触碰
     * @param e
     * @return 该对象是否被选中
     */
    public dispatchTouchEvent(e:SceneTouchEvent):boolean {
        return this.inPreciseRange(e.x, e.y, 5);
    }

    /**
     * 判断某个点是否落在该对象的矩形感应范围内
     * @param x 在canvas内的x
     * @param y 在canvas内的y
     */
    // TODO 缩小范围
    public inRectRange(x:number, y:number):boolean{
        // const corners = this.getCorners();
        const center = this.getCenter();
        const noRotated = RotateUtil.rotate(x, y, center.x, center.y, -this.angle);
        return noRotated[0] >= this.x && noRotated[0] <= this.x + this.width &&
            noRotated[1] >= this.y && noRotated[1] <= this.y + this.height;
        // 利用矩形四个和目标点的向量点乘
        // return (corners[2] - corners[0])*(x - corners[0]) + (corners[3] - corners[1])*(y - corners[1]) >= 0 &&
        //     (corners[6] - corners[0])*(x - corners[0]) + (corners[7] - corners[1])*(y - corners[1]) >= 0 &&
        //     (corners[6] - corners[4])*(x - corners[4]) + (corners[7] - corners[5])*(y - corners[5]) >= 0 &&
        //     (corners[2] - corners[4])*(x - corners[4]) + (corners[3] - corners[5])*(y - corners[5]) >= 0;
    }

    /**
     * 判断某个点是否落在该对象的精确感应范围内
     * @param x 在canvas内的x
     * @param y 在canvas内的y
     * @param radius 提供一定的圆形点范围检测
     */
    public inPreciseRange(x:number, y:number, radius:number):boolean {
        return this.inRectRange(x, y);
    }

    /**
     *  检测对象的旋转句柄是否被触碰
     */
    public isRotateHandle(x:number, y:number):boolean  {
        const center = this.getCenter();
        const p = RotateUtil.rotate(this.x + this.width / 2, this.y - this.strokeWidth / 2 - 20,
            center.x, center.y, this.angle);
        // 采用矩形方框检测
        return x > p[0] - 10
            && x < p[0] + 10
            && y > p[1] - 10
            && y < p[1] + 10;
    }

    /**
     * 检测对象的缩放句柄是否被触碰
     */
    public isScaleHandle(x:number, y:number):boolean {
        const center = this.getCenter();
        const p = RotateUtil.rotate(this.x + this.width + this.strokeWidth / 2,
            this.y + this.height + this.strokeWidth / 2,
            center.x, center.y, this.angle);
        return x > p[0] - 10
            && x < p[0] + 10
            && y > p[1] - 10
            && y < p[1] + 10;
        }

    /**
     *  生成边框角坐标
     */
    // private genAnchors() {
    //     const corners = this.corners;
    //     // 初始化边框角坐标（顺时针顺序）
    //     corners[0] = this.x - this.width / 2 - 5; corners[1] = this.y - this.height / 2 - 5;
    //     corners[2] = this.x + this.width / 2 + 5; corners[3] = this.y - this.height / 2 - 5;
    //     corners[4] = this.x + this.width / 2 + 5; corners[7] = this.y + this.height / 2 + 5;
    //     corners[6] = this.x - this.width / 2 - 5; corners[5] = this.y + this.height / 2 + 5;
    //     // this.rotateHandle[0] = this.x; this.rotateHandle[1] = this.y - this.height / 2 - 20;
    // }

    /**
     * 调整元素大小
     */
    public resize(width:number, height:number) {
        this.width = width; this.height = height;
    }

}



