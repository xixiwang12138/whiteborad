import {Tool, ToolType} from "./Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";
import {TextAlign, TextElement} from "../element/TextElement";

export class TextTool extends Tool {

    protected fontSize:number = 30;

    private _textAlign:TextAlign = "left";
    set textAlign(a:TextAlign){this._textAlign = a;}

    private container!:HTMLElement;

    private textEditor:HTMLTextAreaElement;

    private _editing:boolean = false;

    // 编辑器空间信息
    private editorX:number = 0;
    private editorY:number = 0;
    private editorW:number = 0;
    private editorH:number = 0;

    get editing() {return this._editing;}

    public constructor() {
        super("text");
        this.textEditor = window.document.createElement("textarea");
        this.container = window.document.getElementById("text-editor-container")!;
        this.setUpEditor();
    }

    public closeEditor() {
        this.textEditor.value = "";
        this.container.removeChild(this.textEditor);
        this._editing = false;
        this.editorX = this.editorY = this.editorW = this.editorH = 0;
    }

    /**
     *  判断某个事件是否对该工具起作用
     */
    public outOfBound(e:SceneTouchEvent):boolean {
        return e.rawX > this.editorX + this.editorW ||
            e.rawY > this.editorY + this.editorH ||
            e.rawX < this.editorX ||
            e.rawY < this.editorY;
    }

    private setUpEditor() {
        let style = this.textEditor.style;
        style.position = "absolute";
        style.fontSize = `${this.fontSize}px`;
        style.background = "transparent";
        style.whiteSpace = "pre";
        style.overflowWrap = "break-word";
        style.wordBreak = "normal";
        style.outline = "none";
        style.border = "none";
        style.resize = "none";
        style.overflow = "hidden";
        style.fontFamily = "宋体";
        style.lineHeight = "1.2"; // 字高的1.2倍
    }

    public op(e: SceneTouchEvent, scene: DrawingScene) {
        if(e.type === "down" || e.type === "doubleClick") {
            this.textEditor.style.transform = `scale(${scene.scale},${scene.scale})`;
            if(e.type === "down") {
                // 新创建
                scene.actElem = new TextElement(new Date().valueOf(), e.x, e.y);
                this.textEditor.style.width = "5px"; this.textEditor.style.height = `${this.fontSize}px`
                this.textEditor.style.textAlign = this._textAlign;
            } else {
                // 重新编辑
                const el = scene.actElem! as TextElement;
                this.textEditor.style.width = `${el.width}px`;
                this.textEditor.style.height = `${el.height}px`;
                this.textEditor.style.textAlign = el.textAlign;
                this.textEditor.style.fontSize = `${el.fontSize}px`;
                const c = el.getCenter();
                this.textEditor.style.translate = `${c.x}px ${c.y}px`
                this.textEditor.style.rotate = `${el.angle / Math.PI * 180}deg`
            }
            this._editing = true;
            this.editorX = e.rawX; this.editorY = e.rawY;
            this.textEditor.style.top = `${e.rawY}px`; this.textEditor.style.left = `${e.rawX}px`;
            this.textEditor.oninput = () => {
                let size = scene.measureTextArea(this.textEditor);
                this.textEditor.style.width = `${size.width}px`;
                this.textEditor.style.height = `${size.height}px`;
                this.editorW = size.width; this.editorH = size.height;
                scene.actElem!.resize(size.width, size.height);
                (scene.actElem as TextElement).text = this.textEditor.value;
            }
            this.container.appendChild(this.textEditor);
            // 自动获得焦点
            setTimeout(()=>{
                this.textEditor.focus();
            })
        }

    }

}