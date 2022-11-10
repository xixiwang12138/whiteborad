import React, {useState} from "react";
import {Col, InputNumber, Row, Slider} from "antd";
import "./index.css";
import "../../../../App.css";
import lineWid1 from "../../icon/sStroke.svg";
import lineWid2 from "../../icon/mStroke.svg";
import lineWid3 from "../../icon/lStroke.svg";
import toTop from "../../icon/toTop.svg";
import toBottom from "../../icon/toBottom.svg";
import jumps from "../../icon/toNext.svg";
import jumpx from "../../icon/toLast.svg";
import fuzhi from "../../icon/copy.svg";
import shanchu from "../../icon/delete.svg";
import bianzu from "../../icon/编组.svg";
import fontB from "../../icon/bold.svg";
import fontI from "../../icon/italic.svg";
import fontU from "../../icon/underline.svg";
import fontl from "../../icon/left.svg";
import fontr from "../../icon/right.svg";
import fontc from "../../icon/center.svg";
import {GenericElementType} from "../../app/element/GenericElement";
import {LinearElementType} from "../../app/tools/LinearTool";
import {WinToolType, StrokeWidthType, FontSizeType, FontStyleType, TextAlignType, ElementPositionType, OperationsType} from "../../app/tools/WinTool";

export type SecondLevelType = StrokeWidthType | FontSizeType |
    FontStyleType | TextAlignType | ElementPositionType | OperationsType;
type OnWinToolSelected = (type: WinToolType, secondType?:SecondLevelType) => void;

class WinToolListProp {
    OnWinToolSelected: OnWinToolSelected = () => {};
}

class WinToolList extends React.Component<WinToolListProp> {
    // 不同元素特有的
    private genericFics:(WinToolType[])[] = [
        ["changeBackgroundColor"],
        ["changeStrokeColor"]
    ]
    private lineFics:(WinToolType[] | [WinToolType, SecondLevelType[]])[] = [
        ["changeStrokeColor"],
        ["changeStrokeWidth", ["sStroke", "mStroke", "lStroke"]]
    ]
    private textFics:(WinToolType[] | [WinToolType, SecondLevelType[]])[] =[
        ["changeFontSize", ["sFont", "mFont", "lFont"]],
        ["changeFontStyle", ["bold", "italic", "underline"]],
        ["changeTextAlign", ["left", "center", "right"]]
    ]
    private publicGroups: (WinToolType[] | [WinToolType, SecondLevelType[]])[] = [
        ["changeElementOpacity"],
        ["changeElementPosition",["toTop", "toBottom", "toNext", "toLast"]],
        ["operations", ["copy", "delete"]]
    ]

    private itemGroups:(WinToolType[] | [WinToolType, SecondLevelType[]])[] = [
        ["changeBackgroundColor"],
        ["changeStrokeColor"],
        ["changeStrokeWidth", ["sStroke", "mStroke", "lStroke"]],
        ["changeFontSize", ["sFont", "mFont", "lFont"]],
        ["changeFontStyle", ["bold", "italic", "underline"]],
        ["changeTextAlign", ["left", "center", "right"]],
        ["changeElementOpacity"],
        ["changeElementPosition",["toTop", "toBottom", "toNext", "toLast"]],
        ["operations", ["copy", "delete"]]
    ]
    private readonly onWinToolSelected:OnWinToolSelected;
    public constructor(props: WinToolListProp) {
        super(props);
        this.onWinToolSelected = props.OnWinToolSelected;
    }

    render() {
        return <div className="win-tool-bar">
            {/*缺个判断类型：generic || linear && freePen || text*/}
            {
                this.genericFics.map((t,i)=> {
                    return <div className="figure-bar">
                        <div className="single-box" key={i}>
                            {/*填充 || 描边*/}
                        </div>
                    </div>
                })
            } {
            this.lineFics.map((t,i)=> {
                return <div className="line-bar">
                    <div className="single-box" key={i}>
                        {/*描边 || 线宽*/}
                    </div>
                </div>
            })
        } {
            this.textFics.map((t,i) => {
                return <div className="text-bar">
                    <div className="single-box" key={i}>
                        {/*字体大小 || 字体样式 || 文本对齐*/}
                    </div>
                </div>
            })
        } {
                this.publicGroups.map((t, i)=> {
                    return<div className="public-box">
                        <div className="single-box" key={i}>
                            {/*透明度 || 图层 || 操作*/}
                        </div>
                    </div>
                })
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