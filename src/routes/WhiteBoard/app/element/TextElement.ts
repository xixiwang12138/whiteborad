import {ElementBase, ElementType} from "../../app/element/ElementBase";
import {CanvasScaledCtx} from "../DrawingScene";
import {field} from "../../../../utils/data/DataLoader";
import {FontStyle, TextAlign} from "../tools/TextTool";

export class TextElement extends ElementBase {

    @field
    public fontSize:number = 30;

    @field(String)
    public text:string = "";

    @field(String)
    public textAlign: TextAlign = "left";

    @field(String)
    public fontStyle: FontStyle = "normal";

    public constructor(id:string = "", x:number = 0 , y:number = 0) {
        super(id, x, y, ElementType.text);
        this.text = "";
    }

    public drawBeforeCtxRestore(ctx: CanvasScaledCtx): void {
        if(this.finish){
            const s = ctx._scale;
            ctx.fillStyle = this.strokeColor;
            ctx.textAlign = this.textAlign;
            if(this.fontStyle !== "underline") ctx.lineWidth = this.fontSize / 6;
            ctx.font = this.getStandardFont();
            const lines = this.text.split("\n");
            for(let i = 0;i < lines.length;i++) {
                ctx.fillText(lines[i], this.x * s, (this.y + this.fontSize * (1.2 * i + 1)) * s, this.width * s);
                if(this.fontStyle === "underline") {
                    ctx.beginPath();
                    const y = (this.y + this.fontSize * (1.1 * (i + 1) + 1)) * s;
                    ctx.moveTo(this.x * s, y);
                    ctx.lineTo((this.x + this.width) * s, y);
                    ctx.stroke();
                }
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

    /**
     * 获取css标准font
     */
    public getStandardFont() {
        let res = "";
        if(this.fontStyle !== "underline") {
            res = `${this.fontStyle} ${this.fontSize}px 黑体`;
        } else {
            res = `${this.fontSize}px 黑体`
        }
        return res;
    }





    public drawTo(x: number, y: number) {}
}
