import {ElementBase} from "./element/ElementBase";
import {SceneTouchEvent, SceneTouchEventType} from "./element/TouchEvent";
import {ScaleUtil} from "../../../utils/math";
import {Page} from "./data/Page";

export type OnRenderListener = (cvs:DrawingScene)=>void

export interface CanvasScaledCtx extends CanvasRenderingContext2D {
    _scale:number
}

export class DrawingScene {

    _pageId:string = ""; // TODO 默认渲染页面0？
    set pageId(i:string) {this._pageId = i;}

    // 场景画布位置信息
    public  x:number = 0;
    public y:number = 0;
    public scale:number = 1;

    public readonly width = 1920;
    public readonly height = 1080;

    private elements:Map<string, ElementBase> = new Map<string, ElementBase>();

    private _actElem:ElementBase | null = null; // 当前激活元素，不会被绘制到背景中
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
            this._actElem.draw(this.getScaledCtx(this.realCvsCtx));
        }
        if(this.onRender !== null) this.onRender(this);
    }

    // public setBackgroundOf(elem: ElementBase) {
    //     this.clearCanvas("buffer");
    //     this.elements.delete(elem.id);
    //     this.drawAllElement();
    //     this.elements.set(elem.id, elem);
    // }

    private getScaledCtx(ctx:CanvasRenderingContext2D):CanvasScaledCtx {
        let c = ctx as CanvasScaledCtx;
        c._scale = this.scale;
        return c;
    }
    /**
     * 激活元素, 也就是和背景画布分离
     */
    public activate(elem:ElementBase) {
        this._actElem = elem;
        this.clearCanvas("buffer");
        this.drawAllElement();
        this.render();
    }

    /**
     * 取消激活元素
     */
    public deactivateElem() {
        if(this._actElem !== null) {
            if(!this.elements.get(this._actElem.id)) this.elements.set(this._actElem.id, this._actElem);
            this._actElem.draw(this.getScaledCtx(this.bufCvsCtx));
            this._actElem = null;
            this.render();
        }
    }

    /**
     * 放弃已激活元素（一般是在创建的元素舍弃的时候）
     */
    public dropActElem() {
        if(this.elements.get(this._actElem!.id)) this.elements.delete(this._actElem!.id);
        this._actElem = null;
        this.render();
    }

    /**
     * 判断激活元素是否是已有元素一部分
     */
    public isActElemExist():boolean {
        if(!this._actElem) throw "active element not exist!"
        return this.elements.get(this._actElem.id) !== null;
    }

    /**
     * 用触摸事件尝试查找场景中元素
     */
    public findElemByEvent(e:SceneTouchEvent):ElementBase | null{
        for(let elem of this.elements.values()) {
            if(!elem.isDeleted && elem.dispatchTouchEvent(e)) {
                return elem;
            }
        }
        return null;
    }

    /**
     * 添加新元素到场景并直接绘制到背景板
     */
    public addElem(elem:ElementBase) {
        if(elem.id === null) throw "null id";
        this.elements.set(elem.id, elem);
        elem.draw(this.getScaledCtx(this.bufCvsCtx));
        this.render();
    }

    public restoreElem(id:string) {
        let e = this.elements.get(id);
        if(e) {
            e.isDeleted = false;
            e.draw(this.getScaledCtx(this.bufCvsCtx));
            this.render();
        }
    }

    /**
     *  删除元素重新绘制背景板
     */
    public removeElem(elem:ElementBase) {
        if(elem.id === null) throw "null id";
        let e = this.elements.get(elem.id);
        if(e) e.isDeleted = true;
        this.clearCanvas("buffer");
        this.drawAllElement();
        this.render();
    }

    public getElem(id:string) {
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
        this.realCvs.width = this.bufCvs.width = this.width;
        this.realCvs.height = this.bufCvs.height = this.height;
        this.bufCvsCtx = this.bufCvs.getContext('2d')!;
        this.realCvsCtx = this.realCvs.getContext('2d')!;
        this.clearCanvas();
    }

    private clearCanvas(which?: "real" | "buffer" ) {
        if(which) {
            if(which === "real") {
                this.realCvs.width = this.width * this.scale;
            } else {
                this.bufCvsCtx.fillStyle = "white"; // 背景板用白色填充
                this.bufCvsCtx.fillRect(0,0, this.width * this.scale, this.height * this.scale);
            }
        } else {
            this.realCvs.width = this.width * this.scale;
            this.bufCvsCtx.fillStyle = "white";
            this.bufCvsCtx.fillRect(0,0, this.width * this.scale, this.height * this.scale);
        }
    }

    /**
     *  缩放之后重新调整canvas的大小
     */
    private refreshCanvasSize() {
        this.realCvs.width = this.width * this.scale;
        this.realCvs.height = this.height * this.scale;
        this.bufCvs.width = this.width * this.scale;
        this.bufCvs.height = this.height * this.scale;
    }

    /**
     *  清空背景板并重新绘制所有元素
     */
    private drawAllElement() {
        this.clearCanvas("buffer");
        for(let elem of this.elements.values()) {
            if(!(this._actElem?.id === elem.id ) && !elem.isDeleted) {
                elem.draw(this.getScaledCtx(this.bufCvsCtx));
            }
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
        this.refreshCanvasSize();
        this.drawAllElement();
    }

    public translate(dx:number, dy:number) {
        this.x += dx; this.y += dy;
    }

    /**
     *  将原生触摸事件转化成场景事件
     */
    public toSceneEvent(e:MouseEvent, doubleClick:boolean):SceneTouchEvent {
        if(doubleClick) {
            return new SceneTouchEvent("doubleClick",
                (e.x - this.x) / this.scale,
                (e.y -this.y) / this.scale, e.x, e.y);
        }
        return new SceneTouchEvent(e.type.slice(5) as SceneTouchEventType,
            (e.x - this.x) / this.scale,
            (e.y -this.y) / this.scale, e.x, e.y);
    }

    /**
     *  给定场景内坐标，转化回原生x，y坐标
     */
    public toRawXY(x:number, y:number):number[] {
        return [x * this.scale + this.x, y * this.scale + this.y];
    }

    public renderPage(page:Page) {
        this.clearCanvas();
        this.deactivateElem();
        this.elements = new Map<string, ElementBase>();
        page.elements.forEach(e => {
            e.finish = true;
           this.elements.set(e.id, e);
           e.draw(this.getScaledCtx(this.bufCvsCtx));
        });
        this.render();
    }

}