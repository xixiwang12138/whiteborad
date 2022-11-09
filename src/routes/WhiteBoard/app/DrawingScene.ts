import {ElementBase} from "./element/ElementBase";
import {SceneTouchEvent} from "./element/TouchEvent";
import {ScaleUtil} from "../../../utils/math";

export type OnRenderListener = (cvs:DrawingScene)=>void

export class DrawingScene {

    // 场景画布位置信息
    public  x:number = 0;
    public y:number = 0;
    public scale:number = 1;

    private elements:Map<number, ElementBase> = new Map<number, ElementBase>();

    private _actElem:ElementBase | null = null; // 当前激活元素
    get actElem():ElementBase | null{return this._actElem}
    set actElem(e:ElementBase|null) {this._actElem = e}

    private readonly bufCvs:HTMLCanvasElement;
    public readonly realCvs:HTMLCanvasElement;

    private bufCvsCtx!:CanvasRenderingContext2D;
    private realCvsCtx!:CanvasRenderingContext2D;

    public onRender!:OnRenderListener;

    public constructor() {
        this.bufCvs = document.createElement("canvas") as HTMLCanvasElement;
        this.realCvs = document.createElement("canvas") as HTMLCanvasElement;
        this.setupCanvas();
    }

    public render() {
        this.clearCanvas("real");
        this.realCvsCtx.drawImage(this.bufCvs, 0, 0); // 绘制背景
        if(this._actElem) {
            this._actElem.draw(this.realCvsCtx);
        }
        if(this.onRender !== null) this.onRender(this);
    }

    public setBackgroundOf(elem: ElementBase) {
        this.clearCanvas("buffer");
        this.elements.delete(elem.id);
        this.drawAllElement();
        this.elements.set(elem.id, elem);
    }

    public unSelectAll() {
        if(this._actElem !== null && this._actElem.selected) {
            this._actElem.selected = false;
            this._actElem.draw(this.bufCvsCtx);
            this._actElem = null;
            this.render();
        }
    }

    /**
     * 用触摸事件尝试选择元素
     */
    public findElemByEvent(e:SceneTouchEvent):ElementBase | null{
        for(let elem of this.elements.values()) {
            if(elem.dispatchTouchEvent(e)) {
                return elem;
            }
        }
        return null;
    }

    public addElem(elem:ElementBase) {
        if(elem.id === null) throw "null id";
        this.elements.set(elem.id, elem);
        if(this._actElem) this._actElem.draw(this.bufCvsCtx);
    }

    public removeElem(elem:ElementBase) {
        if(elem.id === null) throw "null id";
        this.elements.delete(elem.id);
        this.clearCanvas();
        this.drawAllElement();
        this.render();
    }

    public getElem(id:number) {
        return this.elements.get(id);
    }

    /**
     *  测量textarea元素的长度，宽度
     */
    public measureTextArea(textarea:HTMLTextAreaElement):{width:number; height:number} {
        this.realCvsCtx.font = getComputedStyle(textarea).font; // 获取字体样式
        let str = textarea.value.split("\n");
        let height = Number.parseInt(textarea.style.fontSize) * 1.2;
        let maxWidth = 0;
        for(let line of str) {
            let size = this.realCvsCtx.measureText(line);
            if(size.width > maxWidth) maxWidth = size.width;
        }
        return {width:maxWidth, height:height * str.length};
    }

    private setupCanvas() {
        this.realCvs.width = this.bufCvs.width = 1920;
        this.realCvs.height = this.bufCvs.height = 1080;
        this.bufCvsCtx = this.bufCvs.getContext('2d')!;
        this.realCvsCtx = this.realCvs.getContext('2d')!;
        this.clearCanvas();
    }

    private clearCanvas(which?: "real" | "buffer" ) {
        if(which) {
            if(which === "real") this.realCvs.width = 1920;
            else {
                this.bufCvsCtx.fillStyle = "white";
                this.bufCvsCtx.fillRect(0,0, 1920, 1080);
            }
        } else {
            this.realCvs.width = 1920;
            this.bufCvsCtx.fillStyle = "white";
            this.bufCvsCtx.fillRect(0,0, 1920, 1080);
        }
    }

    private drawAllElement() {
        for(let elem of this.elements.values()) {
            elem.draw(this.bufCvsCtx);
        }
    }

    /**
     * @param dScale 缩放倍数变化
     * @param sx 保持不变的点x坐标(相对浏览器窗口的原生坐标）
     * @param sy 保持不变的点y坐标
     */

    public zoom(dScale:number, sx:number, sy:number) {
        const pScale = (this.scale + dScale) / this.scale; // 缩放倍数变化倍数
        this.scale += dScale;
        [this.x, this.y] = ScaleUtil.scale(this.x, this.y, pScale, pScale, sx, sy);
    }

    public translate(dx:number, dy:number) {
        this.x += dx; this.y += dy;
    }

}