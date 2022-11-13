import React from "react";
import {Slider} from "antd";
import "./index.css";
import "../../../../App.css";
import {GenericElement} from "../../app/element/GenericElement";
import {
    ColorType,
    ElementPositionType,
    FontSizeType,
    FontStyleType,
    OperationsType,
    StrokeWidthType,
    TextAlignType,
    WinToolType
} from "../../app/tools/WinTool";
import {ElementType} from "../../app/element/ElementBase";
import {TextElement} from "../../app/element/TextElement";
import {PathElement} from "../../app/element/PathElement";
import {Line} from "../../app/element/Line";
import {ToolType} from "../../app/tools/Tool";
import {BoardMode} from "../../index";
import {BoardManager} from "../../../../BoardManager";

export type SecondLevelType = StrokeWidthType | FontSizeType |
    FontStyleType | TextAlignType | ElementPositionType | OperationsType;
type OnWinToolSelected = (type: WinToolType, secondType?:SecondLevelType) => void;

type OnWinTypeSelected = (type: ColorType | StrokeWidthType | FontSizeType | FontStyleType
    | TextAlignType | ElementPositionType | OperationsType) => void;


// class WinToolListProp {
//     OnWinToolSelected: OnWinToolSelected = () => {};
// }


enum ToolBar {
    Fill,
    StrokeColor,
    Strokewidth,
    FontSize,
    FontStyle,
    TextAlign,
    Opacity,
    Operation
}
class WinTypeListProp {
    // OnWinTypeSelected: OnWinTypeSelected = () => {};
    propSetter:ToolReactor
    toolOrElemType: ToolType | ElementType;
    mode: BoardMode
}

export type ElementSum = TextElement & PathElement & GenericElement & Line;


export interface ToolReactor {
    setProps(prop: keyof ElementSum, value: any)
    delete()
}



class WinToolList extends React.Component<WinTypeListProp> {
    // 不同元素特有的
    private genericFics:(WinToolType[])[] = [
        ["changeBackgroundColor"],
        ["changeStrokeColor"]
    ]
    private genericTitles = ["填充", "描边"]
    private lineFics:(WinToolType[] | [WinToolType, SecondLevelType[]])[] = [
        ["changeStrokeColor"],
        ["changeStrokeWidth", ["sStroke", "mStroke", "lStroke"]]
    ]
    private lineTitles = ["描边", "边宽"]
    private textFics:(WinToolType[] | [WinToolType, SecondLevelType[]])[] =[
        // ["changeFontSize", ["sFont", "mFont", "lFont"]],
        ["changeFontStyle", ["bold", "italic", "underline"]],
        ["changeTextAlign", ["left", "center", "right"]]
    ]
    private textTitles = ["字体大小", "字体样式", "文本对齐"]
    private publicGroups: (WinToolType[] | [WinToolType, SecondLevelType[]])[] = [
        ["changeElementOpacity"],
        ["changeElementPosition",["toTop", "toBottom", "toNext", "toLast"]],
        ["operations", ["delete"]]
    ]
    private publicTitles = ["透明度", "图层", "操作"]

    private itemGroups:(WinToolType[] | [WinToolType, SecondLevelType[]])[] = [
        ["changeBackgroundColor"],
        ["changeStrokeColor"],
        ["changeStrokeWidth", ["sStroke", "mStroke", "lStroke"]],
        ["changeFontSize", ["sFont", "mFont", "lFont"]],
        ["changeFontStyle", ["bold", "italic", "underline"]],
        ["changeTextAlign", ["left", "center", "right"]],
        ["changeElementOpacity"],
        // ["changeElementPosition",["toTop", "toBottom", "toNext", "toLast"]],
        ["operations", ["delete"]]
    ]
    private colorGroups: (ColorType[]) [] = [
        ["color1"], ["color2"], ["color3"], ["color4"], ["color5"], ["color6"]
    ]

    //1.black 2.#3E6182 3.#956AA4 4.#A46A6A 5.#609A7E 6.#CE6464
    private colorMap = {
        '0': "#000000",
        '1': "#3E6182",
        '2': "#956AA4",
        '3': "#A46A6A",
        '4': "#609A7E",
        '5': "#CE6464",
    }

    private widthMap = {
        '0': 5,
        '1': 10,
        '2': 20,
    }

    private styleMap = {
        0: "bold",
        1: "italic",
        2: "underline"
    }

    private sizeMap = {
        '0': 20,
        '1': 30,
        '2': 40,
    }

    private textAlignMap = {
        '0': this.textFics[1][1][0],
        '1': this.textFics[1][1][1],
        '2': this.textFics[1][1][2],
    }


    private widthGroups: (StrokeWidthType[]) [] = [
        ["sStroke"], ["mStroke"], ["lStroke"]
    ]
    private sizeGroups: (FontSizeType[]) [] = [
        ["sFont"], ["mFont"], ["lFont"]
    ]
    private sizeText = ["S", "M", "L"]
    private styleGroups: (FontStyleType[]) [] = [
        ["bold"], ["italic"], ["underline"]
    ]
    private alignGroups: (TextAlignType[]) [] = [
        ["left"], ["center"], ["right"]
    ]
    private positionGroups: (ElementPositionType[]) [] = [
        ["toTop"], ["toBottom"], ["toNext"], ["toLast"]
    ]
    private operationGroups: (OperationsType[]) [] = [
        ["delete"]
    ]

    // private readonly onWinToolSelected:OnWinToolSelected;
    // public constructor(props: WinToolListProp) {
    //     super(props);
    //     this.onWinToolSelected = props.OnWinToolSelected;
    // };

    // private readonly onWinTypeSelected:OnWinTypeSelected;

    private winToolType: ToolType | ElementType;
    private propSetter: ToolReactor

    public constructor(props: WinTypeListProp) {
        super(props);
        // this.onWinTypeSelected = props.OnWinTypeSelected;
        this.winToolType = props.toolOrElemType;
        this.propSetter = props.propSetter
    }

    state = {
        displays : [false, false, false, false, false, false, false, false],
        propertyState:{
            [ElementType.text]:{},
            [ElementType.linear]:{},
            [ElementType.generic]:{},
            [ElementType.freedraw]:{}
        },
        mode: BoardMode.Editable
    }

    async componentDidMount() {
        this.setState({mode: await BoardManager.getMode()})
    }

    async componentWillReceiveProps(nextProps: Readonly<WinTypeListProp>, nextContext: any) {
        let displays = [false, false, false, false, false, false, false, false] ;        // 如果不为工具类型, 表示为选中元素，才提供操作
        if(typeof nextProps.toolOrElemType !== "string") {
            displays[ToolBar.Operation] = true;
        }
        displays[ToolBar.StrokeColor] = true
        displays[ToolBar.Strokewidth] = true
        displays[ToolBar.Opacity] = true
        switch (nextProps.toolOrElemType) {
            case "generic":
            case ElementType.generic: displays[ToolBar.Fill] = true; break;
            case "text":
            case ElementType.text: {
                displays[ToolBar.Strokewidth] = false;
                displays[ToolBar.FontStyle] = true
                displays[ToolBar.FontSize] = true
                displays[ToolBar.TextAlign] = true
                break
            }
        }
        this.setState({displays})
        this.setState({mode: nextProps.mode})
    }

    render() {
        //填充颜色
        const clickFillColor = (e: React.MouseEvent<HTMLDivElement>) => {
            const selectedColorIdx = e.currentTarget.id
            this.propSetter.setProps("backgroundColor", this.colorMap[selectedColorIdx]);
        }

        //边框颜色
        const clickLineColor = (e: React.MouseEvent<HTMLDivElement>) => {
            const selectedColorIdx = e.currentTarget.id
            this.propSetter.setProps("strokeColor", this.colorMap[selectedColorIdx]);
        }


        //描边宽度
        const clickWidth = (e: React.MouseEvent<HTMLDivElement>) => {
            const selectedId = e.currentTarget.id
            this.propSetter.setProps("strokeWidth", this.widthMap[selectedId])
        }

        //字体大小
        const clickFontSize = (e: React.MouseEvent<HTMLDivElement>) => {
            const selectedId = e.currentTarget.id
            this.propSetter.setProps("fontSize", this.sizeMap[selectedId])
        }

        const clickFontStyle = (e: React.MouseEvent<HTMLDivElement>) => {
            const selectedId = e.currentTarget.id
            this.propSetter.setProps("fontStyle", this.styleMap[selectedId])
        }

        //文本对其
        const clickTextAlign = (e: React.MouseEvent<HTMLDivElement>) => {
            const selectedId = e.currentTarget.id
            this.propSetter.setProps("textAlign", this.textAlignMap[selectedId])
        }

        //文本对其
        const changeOpacity  = (value: number) => {
            this.propSetter.setProps("opacity", value)
        }

        //操作
        const clickOperation = (e: React.MouseEvent<HTMLDivElement>) => {
            const selectedId = e.currentTarget.id
            switch (selectedId) {
                case '0': this.propSetter.delete();break;
                default: throw new Error("no supported operation");
            }
        }

        const str = (i: number)  => { return i + ""}

        const isEditable = () => {
            return this.state.mode === BoardMode.Editable
        }

        return <div style={{display: isEditable() ? "flex" : "none"}}> {
            this.props.toolOrElemType !== ElementType.none && <div className="win-tool-bar">
                {/*缺个判断类型：isGeneric || isPen || isText --> display为flex或none */}
                <div className="single-box" style={{display: this.state.displays[ToolBar.Fill] ? "flex" : "none"}}>
                    <div className="single-box-title">填充</div>
                    <div className="single-box-contain">
                        <div className="single-box-contain">{
                            this.colorGroups.map((t,i) => {
                                return <div key={i} id={str(i)} className="color-box" onClick={(e) => clickFillColor(e)}>{
                                    t.map(s =>
                                        <img style={{width: "30px", height: "30px"}} src={require(`../../icon/${s}.svg`)}/>)
                                }</div>
                            })
                        }</div>
                    </div>
                </div>
                <div className="single-box" style={{display:  this.state.displays[ToolBar.StrokeColor]  ? "flex" : "none"}}>
                    <div className="single-box-title">描边</div>
                    <div className="single-box-contain">{
                        this.colorGroups.map((t,i) => {
                            return <div key={i} id={str(i)} className="color-box" onClick={(e) => clickLineColor(e)} >{
                                t.map(s =>
                                    <img style={{width: "30px", height: "30px"}} src={require(`../../icon/${s}.svg`)}/>)
                            }</div>
                        })
                    }</div>
                </div>
                <div className="single-box" style={{display:  this.state.displays[ToolBar.Strokewidth]  ? "flex" : "none"}}>
                    <div className="single-box-title">描边宽度</div>
                    <div className="single-box-contain" >{
                        this.widthGroups.map((t,i) => {
                            return <div key={i} id={str(i)} className="border-box" onClick={(e) => clickWidth(e)}>{
                                t.map(s =>
                                    <img src={require(`../../icon/${s}.svg`)}/>)
                            }</div>
                        })
                    }</div>
                </div>
                <div className="single-box" style={{display:  this.state.displays[ToolBar.FontSize]  ? "flex" : "none"}}>
                    <div className="single-box-title">字体大小</div>
                    <div className="single-box-contain">{
                        this.sizeGroups.map((t,i) => {
                            return <div className="border-box" key={i} id={str(i)} style={{color: "black"}} onClick={(e) => clickFontSize(e)}>{
                                this.sizeText[i]
                            }</div>
                        })
                    }</div>
                </div>
                <div className="single-box" style={{display:  this.state.displays[ToolBar.FontStyle]  ? "flex" : "none"}}>
                    <div className="single-box-title">字体样式</div>
                    <div className="single-box-contain">{
                        this.styleGroups.map((t,i) => {
                            return <div key={i} id={str(i)} className="border-box" onClick={(e) => clickFontStyle(e)} >{
                                t.map(s =>
                                    <img style={{width: "16px", height: "16px"}} src={require(`../../icon/${s}.svg`)}/>)
                            }</div>
                        })
                    }</div>
                </div>
                <div className="single-box" style={{display:  this.state.displays[ToolBar.TextAlign]  ? "flex" : "none"}}>
                    <div className="single-box-title">文本对齐</div>
                    <div className="single-box-contain">{
                        this.alignGroups.map((t,i) => {
                            return <div key={i}  className="border-box"  id={str(i)}  onClick={(e) => clickTextAlign(e)}  >{
                                t.map(s =>
                                    <img style={{width: "16px", height: "16px"}} src={require(`../../icon/${s}.svg`)}/>)
                            }</div>
                        })
                    }</div>
                </div>
                <div className="single-box" style={{display:  this.state.displays[ToolBar.Opacity]  ? "flex" : "none"}}>
                    <div className="single-box-title">透明度</div>
                    <div className="single-box-contain">
                        <Slider className="slider-opacity" defaultValue={10} onChange={(value) => {
                            changeOpacity(value / 100)
                        }}/>
                    </div>
                </div>
                {/*图层暂时不做*/}
                {/*<div className="single-box">*/}
                {/*    <div className="single-box-title">图层</div>*/}
                {/*    <div className="single-box-contain">{*/}
                {/*        this.positionGroups.map((t,i) => {*/}
                {/*            return <div key={i} className="border-box" id={str(i)} onClick={(e) => clickPosition(e)}>{*/}
                {/*                t.map(s =>*/}
                {/*                    <img style={{width: "16px", height: "16px"}} src={require(`../../icon/${s}.svg`)}/>)*/}
                {/*            }</div>*/}
                {/*        })*/}
                {/*    }</div>*/}
                {/*</div>*/}
                <div className="single-box" style={{display:  this.state.displays[ToolBar.Operation]  ? "flex" : "none"}}>
                    <div className="single-box-title">操作</div>
                    <div className="single-box-contain">{
                        this.operationGroups.map((t,i) => {
                            return <div key={i} className="border-box" id={str(i)} onClick={(e) => clickOperation(e)}>{
                                t.map(s =>
                                    <img style={{width: "16px", height: "16px"}} src={require(`../../icon/${s}.svg`)}/>)
                            }</div>
                        })
                    }</div>
                </div>
            </div>
        }
        </div>
    }
}

export default WinToolList;

// function WindowToolBar() {
//
//     const [inputValue, setInputValue] = useState(100);
//     const onChange = (newValue: number) => {
//         setInputValue(newValue);
//     }
//     //获取透明度：inputValue
//
//
//     return (
//         <div className="win-tool-bar">
//             {/*添加判定:监听鼠标选中的element种类*/}
//
//             {/*1.规则图形：矩形、圆形、三角形*/}
//
//             <div className="figure-bar">
//                 <div className="figure-box">
//                     <div className="single-box">
//                         <div className="single-box-title">填充</div>
//                         <div className="single-box-contain">
//                             {/*颜色暂时随便定的*/}
//                             <div className="color-box" style={{backgroundColor: "black"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#3E6182"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#956AA4"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#A46A6A"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#609A7E"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#CE6464"}}></div>
//                         </div>
//                     </div>
//                     <div className="single-box">
//                         <div className="single-box-title">描边</div>
//                         <div className="single-box-contain">
//                             <div className="color-box" style={{backgroundColor: "black"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#3E6182"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#956AA4"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#A46A6A"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#609A7E"}}></div>
//                             <div className="color-box" style={{backgroundColor: "#CE6464"}}></div>
//                         </div>
//                     </div>
//                     <div className="single-box">
//                         <div className="single-box-title">描边宽度</div>
//                         <div className="single-box-contain">
//                             <div className="border-box"><img src={lineWid1}/></div>
//                             <div className="border-box"><img src={lineWid2}/></div>
//                             <div className="border-box"><img src={lineWid3}/></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             {/*2.箭头、直线、画笔*/}
//
//             {/*<div className="line-bar">*/}
//             {/*    <div className="line-box">*/}
//             {/*        <div className="single-box">*/}
//             {/*            <div className="single-box-title">描边</div>*/}
//             {/*            <div className="single-box-contain">*/}
//             {/*                <div className="color-box" style={{backgroundColor: "black"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#3E6182"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#956AA4"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#A46A6A"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#609A7E"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#CE6464"}}></div>*/}
//             {/*            </div>*/}
//             {/*        </div>*/}
//             {/*        <div className="single-box">*/}
//             {/*            <div className="single-box-title">描边宽度</div>*/}
//             {/*            <div className="single-box-contain">*/}
//             {/*                <div className="border-box"><img src={linebord1}/></div>*/}
//             {/*                <div className="border-box"><img src={linebord2}/></div>*/}
//             {/*                <div className="border-box"><img src={linebord3}/></div>*/}
//             {/*            </div>*/}
//             {/*        </div>*/}
//             {/*    </div>*/}
//             {/*</div>*/}
//
//             {/*3.文本*/}
//
//             {/*<div className="text-bar">*/}
//             {/*    <div className="text-box">*/}
//             {/*        <div className="single-box">*/}
//             {/*            <div className="single-box-title">描边</div>*/}
//             {/*            <div className="single-box-contain">*/}
//             {/*                <div className="color-box" style={{backgroundColor: "black"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#3E6182"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#956AA4"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#A46A6A"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#609A7E"}}></div>*/}
//             {/*                <div className="color-box" style={{backgroundColor: "#CE6464"}}></div>*/}
//             {/*            </div>*/}
//             {/*        </div>*/}
//             {/*        <div className="single-box">*/}
//             {/*            <div className="single-box-title">字体大小</div>*/}
//             {/*            <div className="single-box-contain">*/}
//             {/*                <div className="font-box">S</div>*/}
//             {/*                <div className="font-box">M</div>*/}
//             {/*                <div className="font-box">L</div>*/}
//             {/*                <div className="font-box">XL</div>*/}
//             {/*            </div>*/}
//             {/*        </div>*/}
//             {/*        <div className="single-box">*/}
//             {/*            <div className="single-box-title">字体样式</div>*/}
//             {/*            <div className="single-box-contain">*/}
//             {/*                <div className="font-box" title="加粗"><img src={fontB}/></div>*/}
//             {/*                <div className="font-box" title="斜体"><img src={fontI}/></div>*/}
//             {/*                <div className="font-box" title="下划线"><img src={fontU}/></div>*/}
//             {/*            </div>*/}
//             {/*        </div>*/}
//             {/*        <div className="single-box">*/}
//             {/*            <div className="single-box-title">文本对齐</div>*/}
//             {/*            <div className="single-box-contain">*/}
//             {/*                <div className="font-box" title="左对齐"><img src={fontl}/></div>*/}
//             {/*                <div className="font-box" title="居中对齐"><img src={fontc}/></div>*/}
//             {/*                <div className="font-box" title="右对齐"><img src={fontr}/></div>*/}
//             {/*            </div>*/}
//             {/*        </div>*/}
//             {/*    </div>*/}
//             {/*</div>*/}
//
//             {/*4.通用（无需判断）：透明度、对齐（已注释掉）、图层、操作*/}
//             <div className="public-box">
//                 <div className="single-box">
//                     <div className="single-box-title">透明度</div>
//                     <div>
//                         <Slider defaultValue={100} min={0} max={100} onChange={onChange}
//                         value={typeof inputValue === 'number' ? inputValue : 100}/>
//                         {/*滑动条拖动可以同步数据，反过来不行？？*/}
//                         {/*<InputNumber min={0} max={100} style={{margin: '0 16px'}}*/}
//                         {/*value={inputValue} onChange={()=>onChange}/>*/}
//                     </div>
//                 </div>
//                 {/*<div className="single-box">*/}
//                 {/*    <div className="single-box-title">对齐</div>*/}
//                 {/*    <div className="single-box-contain">*/}
//                 {/*        <div className="icon-box"></div>*/}
//                 {/*        <div className="icon-box"></div>*/}
//                 {/*        <div className="icon-box"></div>*/}
//                 {/*        <div className="icon-box"></div>*/}
//                 {/*        <div className="icon-box"></div>*/}
//                 {/*        <div className="icon-box"></div>*/}
//                 {/*    </div>*/}
//                 {/*</div>*/}
//                 <div className="single-box">
//                     <div className="single-box-title">图层</div>
//                     <div className="single-box-contain">
//                         <div className="icon-box" title="置于顶层"><img src={toTop}/></div>
//                         <div className="icon-box" title="置于底层"><img src={toBottom}/></div>
//                         <div className="icon-box" title="上移一层"><img src={jumps}/></div>
//                         <div className="icon-box" title="下移一层"><img src={jumpx}/></div>
//                     </div>
//                 </div>
//                 <div className="single-box">
//                     <div className="single-box-title">操作</div>
//                     <div className="single-box-contain">
//                         <div className="icon-box" title="复制"><img src={fuzhi}/></div>
//                         <div className="icon-box" title="删除"><img src={shanchu}/></div>
//                         {/*编组这个功能好像不是很必要，而且还是多个element的*/}
//                         {/*<div className="icon-box" title="编组"><img src={bianzu}/></div>*/}
//                     </div>
//                 </div>
//             </div>
//
//         </div>
//     )
// }
//
// export default WindowToolBar;
