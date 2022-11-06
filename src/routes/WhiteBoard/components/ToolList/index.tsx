import React from "react";
import "./index.css";
import last from "../../icon/上一步.svg";
import next from "../../icon/下一步.svg";
import hand from "../../icon/平移.svg";
import cur from "../../icon/鼠标.svg";
import jiantou from "../../icon/箭头.svg";
import zhixian from "../../icon/直线.svg";
import pen from "../../icon/画笔.svg";
import ers from "../../icon/橡皮擦.svg";
import font from "../../icon/文字.svg";
import pic from "../../icon/图片.svg";
import shang from "../../icon/向上展开.svg";
import juxing from "../../icon/矩形.svg";
import sanjiao from "../../icon/三角形.svg";
import wujiao from "../../icon/五角星.svg";
import yuan from "../../icon/圆形.svg";
//icon接下来准备写一个单独的文件，就不用引入这么多
import type {MenuProps} from "antd";
import {Dropdown, Space} from "antd";

function ToolList() {

    {/*const items: MenuProps['items'] = [*/}
    {/*    {*/}
    {/*        label: '圆形',*/}
    {/*        key: '0',*/}
    //     },
    //     {
    {/*        label: '矩形',*/}
    //         key: '1',
    //     },
    //     {
    //         label: '三角形',
    //         key: '2',
    //     },
    //     {
    //         label: '五角星',
    //         key: '3',
    //     },
    // ]

    return(
        <div className="tool-list">
            <div className="tool-do">
                <div className="do-box">
                    <div className="icon"><img src={last}/></div>
                    <div className="icon"><img src={next}/></div>
                </div>
            </div>
            <div className="tool-bar">
                <div className="bar-minbox">
                    <div className="bar-icon"><img src={hand}/></div>
                    <div className="bar-icon"><img src={cur}/></div>
                </div>
                <div className="bar-maxbox">
                    <div className="bar-icon"><img src={juxing}/></div>
                    <div className="bar-icon"><img src={yuan}/></div>
                    <div className="bar-icon"><img src={sanjiao}/></div>
                    {/*<div className="bar-dropup">*/}
                    {/*    <Dropdown menu={{items}}>*/}
                    {/*        <a onClick={e => e.preventDefault()}>*/}
                    {/*            <Space>圆形 和 上选矿</Space>*/}
                    {/*        </a>*/}
                    {/*    </Dropdown>*/}
                    {/*</div>*/}
                </div>
                <div className="bar-minbox">
                    <div className="bar-icon"><img src={jiantou}/></div>
                    <div className="bar-icon"><img src={zhixian}/></div>
                </div>
                <div className="bar-minbox">
                    <div className="bar-icon"><img src={pen}/></div>
                    <div className="bar-icon"><img src={ers}/></div>
                </div>
                <div className="bar-minbox">
                    <div className="bar-icon"><img style={{width: '20px', height: '20px'}} src={font}/></div>
                    <div className="bar-icon"><img src={pic}/></div>
                </div>
            </div>
            <div className="tool-zhanwei"></div>
        </div>
    )
}

export default ToolList;