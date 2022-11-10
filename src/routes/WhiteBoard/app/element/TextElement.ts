import {ElementBase, ElementType} from "../../app/element/ElementBase";

export type TextAlign = "left" | "center" | "right";

export class TextElement extends ElementBase {

    public fontSize:number = 30;

    public text:string;

    public textAlign: TextAlign = "left";

    public constructor(id:string, x:number, y:number) {
        super(id, x, y, ElementType.text);
        this.text = "";
    }

    public drawBeforeCtxRestore(ctx: CanvasRenderingContext2D) {
        if(this.finish){
            ctx.fillStyle = this.strokeColor;
            ctx.textAlign = this.textAlign;
            ctx.font = `${this.fontSize}px 宋体`;
            const lines = this.text.split("\n");
            for(let i = 0;i < lines.length;i++) {
                ctx.fillText(lines[i], this.x , this.y + this.fontSize * (1.2 * i + 1), this.width);
            }
        }
    }

    public scale(factorH: number, factorV: number) {
        const center = this.getCenter();
        this.width = this._width * factorV;
        this.height = this._height * factorV; // 纵横保持一致缩放比例
        // 重新计算左上原点
        this.x = center.x - this.width / 2;
        this.y = center.y - this.height / 2;
        this.fontSize = Math.floor(this.height / this.text.split("\n").length / 1.2);
    }


    public drawTo(x: number, y: number) {}
}