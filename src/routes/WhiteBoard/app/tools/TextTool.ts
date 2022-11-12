import {Creator, ICreator, IModifier, OnCreate, OnModify, Tool} from "./Tool";
import {SceneTouchEvent} from "../element/TouchEvent";
import {DrawingScene} from "../DrawingScene";
import {TextElement} from "../element/TextElement";
import {CmdType} from "../../ws/message";
import {IdGenerator} from "../../../../utils/IdGenerator";

export type FontStyle = "normal" | "bold"  | "italic" | "underline";

export type TextAlign = "left" | "center" | "right";

export class TextTool extends Tool
    implements IModifier<CmdType.Adjust | CmdType.Delete>, ICreator{

    protected fontSize:number = 30;

    protected fontStyle:FontStyle = "normal";

    private textAlign:TextAlign = "left";

    private container!:HTMLElement;

    private textEditor:HTMLTextAreaElement;

    // private _editing:boolean = false;

    private editState: "create" | "edit" = "edit";

    private _curElem:TextElement|null = null; // 不为null代表正在编辑
    get curElem(){return this._curElem;}

    // 编辑器空间信息
    private editorX:number = 0;
    private editorY:number = 0;
    private editorW:number = 0;
    private editorH:number = 0;

    // get editing() {return this._editing;}

    public constructor() {
        super("text");
        this.textEditor = window.document.createElement("textarea");
        this.container = window.document.getElementById("text-editor-container")!;
        this.setUpEditor();
    }

    public finishEditing():boolean {
        let flag = false;
        // 统计变化
        let change:Record<string, [any, any]> = {
            text: [this.curElem!.text, this.textEditor.value],
        }
        if(this.editorW !== this._curElem!.width) change["width"] = [this._curElem!.width, this.editorW];
        if(this.editorH !== this._curElem!.height) change["height"] = [this._curElem!.height, this.editorH];
        // 更新对象
        this._curElem!.text = this.textEditor.value;
        this._curElem!.fontStyle = this.fontStyle;
        this._curElem!.strokeColor = this.strokeColor;
        this._curElem!.textAlign = this.textAlign;
        this._curElem!.resize(this.editorW, this.editorH);
        if(this.editState === "create") {
            if(this.textEditor.value) {
                this.onCreate(this._curElem!); // 字符串不为空才保留
                flag = true;
            }
        } else {
            if(this.textEditor.value) {
                this.onModify(CmdType.Adjust, this.curElem!, change)
                flag = true;
            } else {
                this._curElem.isDeleted = true;
                this.onModify(CmdType.Delete, this.curElem!, null);
            }
        }
        this._curElem!.finish = true;
        this._curElem = null;
        this.textEditor.value = "";
        this.container.removeChild(this.textEditor);
        // this._editing = false;
        this.editorX = this.editorY = this.editorW = this.editorH = 0;
        return flag;
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
        style.fontFamily = "黑体";
        style.lineHeight = "1.2"; // 字高的1.2倍
    }

    public op(e: SceneTouchEvent, scene: DrawingScene) {
        if(e.type === "down" || e.type === "doubleClick") {
            if(this.curElem) {
                if(this.outOfBound(e)) {
                    if(this.finishEditing()) scene.deactivateElem();
                    else scene.dropActElem();
                }
            } else {
                if(e.type === "down") this.createText(e, scene);
                else {
                    if(!this.editText(e, scene)) return;
                }
                this._curElem.finish = false;
                this.editorX = e.rawX; this.editorY = e.rawY;
                this.textEditor.oninput = () => {
                    let size = scene.measureTextArea(this.textEditor);
                    this.textEditor.style.width = `${size.width}px`;
                    this.textEditor.style.height = `${size.height}px`;
                    this.editorW = size.width; this.editorH = size.height;
                }
                this.container.appendChild(this.textEditor);
                // 自动获得焦点
                setTimeout(()=>{
                    this.textEditor.focus();
                })
            }
        }
    }

    private createText(e: SceneTouchEvent, scene: DrawingScene) {
        this.textEditor.style.top = `${e.rawY}px`; this.textEditor.style.left = `${e.rawX}px`;
        this.textEditor.style.transformOrigin = "left top"; // 设置缩放中心点为左上角
        // 新创建
        this._curElem = scene.actElem = new TextElement(IdGenerator.genElementId(), e.x, e.y);
        this.editState = "create";
        this.textEditor.style.width = "5px"; this.textEditor.style.height = `${this.fontSize}px`;
        this.textEditor.style.font = this.getStandardFont();
        this.textEditor.style.textAlign = this.textAlign;
        this.textEditor.style.color = this.strokeColor;
        this.textEditor.style.opacity = `${this.opacity}`;
        this.textEditor.style.transform = `scale(${scene.scale},${scene.scale})`;
    }

    /**
     *  返回是否进入编辑状态，主要是因为，当用户使用文本工具，超范围第一次down完成编辑，第二次发送doubleClick会激活编辑状态
     */
    private editText(e: SceneTouchEvent, scene: DrawingScene):boolean {
        const el = this._curElem = scene.actElem! as TextElement;
        if(!el) return false;
        this.textEditor.style.top = `${e.rawY}px`; this.textEditor.style.left = `${e.rawX}px`;
        this.textEditor.style.transformOrigin = "left top"; // 设置缩放中心点为左上角
        // 重新编辑
        this.editState = "edit";
        this.textEditor.style.width = `${el.width}px`; this.editorW = el.width;
        this.textEditor.style.height = `${el.height}px`; this.editorH = el.height;
        if(el.fontStyle === "underline") this.textEditor.style.textDecoration = "underline";
        this.textEditor.style.font = el.getStandardFont();
        this.textEditor.style.textAlign = el.textAlign;
        this.textEditor.style.color = el.strokeColor;
        this.textEditor.value = el.text;
        this.textEditor.style.opacity = `${this.opacity}`;
        this.textEditor.style.transform = `scale(${scene.scale},${scene.scale}) rotate(${el.angle / Math.PI * 180}deg)`;
        // TODO 编辑器打开的时候还是有小bug
        return true;
    }

    onCreate:OnCreate = () => {}

    onModify:OnModify<CmdType.Adjust | CmdType.Delete> = () => {}

    public setOnCreateListener(l: OnCreate): void {
        this.onCreate = l
    }

    public setOnModifyListener(l: OnModify<CmdType.Adjust | CmdType.Delete>): void {
        this.onModify = l;
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

}
