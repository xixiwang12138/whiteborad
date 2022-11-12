import React, {useState} from "react";
import "./index.css";
import "../../../../App.css"
import undo from "../../icon/undo.svg"
import redo from "../../icon/redo.svg";
import {Button} from "antd";
import {ToolType} from "../../app/tools/Tool";
import {GenericElementType} from "../../app/element/GenericElement";
import {LinearElementType} from "../../app/tools/LinearTool";
import {Op, OperableListener} from "../../app/operationTracker/OperationTracker";


// export const DODOs = [
//     {
//         name: "undo",
//         src: undo,
//         disabled: false
//     },
//     {
//         name: "redo",
//         src: redo,
//         disabled: true
//     }
//
// ]

export type SecondLevelType = GenericElementType | LinearElementType; // 二级类型，比如椭圆是通用类型的二级类型
type OnToolSelected = (type:ToolType, secondType?:SecondLevelType) => void;
export interface IOpListener {
    onUndo():void;
    onRedo():void;
}

class ToolListProp {
    onToolSelected:OnToolSelected = () => {};
    opListener:IOpListener = new class implements IOpListener {
        onRedo():void{}
        onUndo():void{}
    }()
}

class ToolList extends React.Component<ToolListProp> implements OperableListener {

    state:{undoAble:boolean; redoAble:boolean;}

    // 这里的类型意思是，一级类型数组 | 一级类型，[二级类型数组]
    private iconGroups:(ToolType[]|[ToolType, SecondLevelType[]])[] = [
        ["translation", "selection"],
        ["generic", ["rectangle", "ellipse"]],
        ["linear", ["line", "arrow"]],
        ["freePen", "eraser"],
        ["text", "image"]
    ]

    private readonly onToolSelected:OnToolSelected;

    private readonly opListener:IOpListener;

    public constructor(props:ToolListProp) {
        super(props);
        this.onToolSelected = props.onToolSelected;
        this.opListener = props.opListener;
        this.state =  {
            undoAble:false,
            redoAble:false
        }
    }

    public onAbilityChange(op:Op, ability:boolean) {
        if (op === "undo") this.setState({undoAble: ability});
        else this.setState({redoAble: ability});
    }

    render() {
        return <div className="tool-list">
            <div className="tool-do">
                <div className="do-box">
                    <Button className={"icon" + this.state.undoAble ? "" : "icon-disabled"} name="undo"
                            onClick={this.opListener.onUndo.bind(this.opListener)}>
                        <img src={undo}/>
                    </Button>
                    <Button className={"icon" + this.state.redoAble ? "" : "icon-disabled"} name="redo"
                            onClick={this.opListener.onRedo.bind(this.opListener)}>
                        <img src={redo}/>
                    </Button>
                </div>
            </div>
            <div className="tool-bar"> {
                    this.iconGroups.map((t,i) => {
                        return <div key={i} className={"bar-box" + (i === 4? "" : " separate")}>{
                            // 存在二级元素
                            t.length > 1 && t[1] instanceof Array ?
                                t[1].map(s =>
                                    <div key={s} className="bar-icon" onClick={()=>this.onToolSelected(t[0], s)}>
                                        <img className="bar-icon-selected" src={require(`../../icon/${s}.svg`)}/>
                                    </div>
                                ) :
                                t.map(f =>
                                    <div key={f as ToolType} className="bar-icon" onClick={()=>this.onToolSelected(f as ToolType)}>
                                        <img src={require(`../../icon/${f}.svg`)}/>
                                    </div>
                                )}
                        </div>
                    })}
            </div>
        </div>
    }

}

// function ToolList() {
//
//     {/*const items: MenuProps['items'] = [*/}
//     {/*    {*/}
//     {/*        label: '圆形',*/}
//     {/*        key: '0',*/}
//     //     },
//     //     {
//     {/*        label: '矩形',*/}
//     //         key: '1',
//     //     },
//     //     {
//     //         label: '三角形',
//     //         key: '2',
//     //     },
//     //     {
//     //         label: '五角星',
//     //         key: '3',
//     //     },
//     // ]
//     // return(
//     //   <div className="tool-list">
//             <div className="tool-do">
//                 <div className="do-box">
//                     <div className="icon"><img src={undo}/></div>
//                     <div className="icon"><img src={redo}/></div>
//                 </div>
//             </div>
//             <div className="tool-bar">
//                 <div className="bar-minbox">
//                     <div className="bar-icon"><img src={translation}/></div>
//                     <div className="bar-icon"><img src={selection}/></div>
//                 </div>
//                 <div className="bar-maxbox">
//                     <div className="bar-icon"><img src={rect}/></div>
//                     <div className="bar-icon"><img src={ellipse}/></div>
//                     <div className="bar-icon"><img src={triangle}/></div>
//                     {/*<div className="bar-dropup">*/}
//                     {/*    <Dropdown menu={{items}}>*/}
//                     {/*        <a onClick={e => e.preventDefault()}>*/}
//                     {/*            <Space>圆形 和 上选矿</Space>*/}
//                     {/*        </a>*/}
//                     {/*    </Dropdown>*/}
//                     {/*</div>*/}
//                 </div>
//                 <div className="bar-minbox">
//                     <div className="bar-icon"><img src={arrow}/></div>
//                     <div className="bar-icon"><img src={line}/></div>
//                 </div>
//                 <div className="bar-minbox">
//                     <div className="bar-icon"><img src={pen}/></div>
//                     <div className="bar-icon"><img src={ers}/></div>
//                 </div>
//                 <div className="bar-minbox">
//                     <div className="bar-icon"><img style={{width: '20px', height: '20px'}} src={font}/></div>
//                     <div className="bar-icon"><img src={pic}/></div>
//                 </div>
//             </div>
//             <div className="tool-zhanwei"></div>
//         </div>
//     // )
// }

export default ToolList;