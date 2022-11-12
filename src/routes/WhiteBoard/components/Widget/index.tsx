import React, {useEffect, useState} from "react";
import "./index.css";
import "../../../../App.css";


import attribute from "../../icon/属性选中.svg";
import {Avatar, Tooltip, Dropdown, Button, Modal, Popover, Checkbox, Radio, message, Form, Input} from "antd";
import {NavLink} from 'react-router-dom';
import {UserManager} from "../../../../UserManager";
import {exportFile, getPages} from "../../../../api/api";
import reduce from "../../icon/reduce.svg";
import plus from "../../icon/plus.svg";
import up from "../../icon/up.svg";
import down from "../../icon/down.svg";
import {Page} from "../../app/data/Page";

export type ScaleType = "enlarge" | "small";

export interface IWidget {
    onScale(t:ScaleType):number;
    onSwitchPage(pageId:string):void;
    onCreatePage(name:string):Promise<Page[]>;
}

class WidgetProps {
    boardId: string = "白板id";
    wCtrl:IWidget;
    scale: number = 1; // 当前缩放比例
}

class Widget extends React.Component<WidgetProps> {

    state = {
        expandPage: false,
        creatingPage: false,
        newPageName: "页面1",
        curPage: null, // 当前页面
        otherPages:[] // 其他页面
    }

    async componentWillReceiveProps(nextProp) {
        if(nextProp.boardId !== this.props.boardId) {
            await this.getPages(nextProp.boardId);
        }
    }

    private scale(t:ScaleType) {
        let newScale = this.props.wCtrl.onScale(t);
        if(newScale !== -1) this.setState({scale: newScale})
    }

    private openCreatePageWindow() {
        this.setState({creatingPage: true, newPageName: `页面${this.state.otherPages.length + 2}`})
    }

    private async createPage() {
        let res  = await this.props.wCtrl.onCreatePage(this.state.newPageName);
        let curPage = res.splice(res.length - 1, 1)[0];
        this.setState({
            expandPage: false,
            creatingPage: false,
            curPage: curPage,
        })
        this.setState({otherPages: res});
    }

    private expandPages() {
        this.getPages(this.props.boardId).then();
        this.setState({expandPage : true});
    }

    private async getPages(boardId:string) {
        let res = await getPages(boardId);
        if(this.state.curPage) {
            let curPageIdx = res.findIndex((p) => {if(p.id === this.state.curPage.id) return true});
            res.splice(curPageIdx, 1);
        } else {
            let curPage = res.splice(0,1)[0];
            this.setState({curPage});
        }
        this.setState({otherPages: res});
    }

    private switchPage(p:Page) {
        this.props.wCtrl.onSwitchPage(p.id);
        this.setState({curPage:p, expandPage:false})
    }

    render() {
        return(
            <div>
            <div className="base-row2">
                <div className={"box-wrapper"} style={{left: "20px"}}>
                    <div className="box box-main" >
                        <div className="icon" onClick={() => this.scale.bind(this)("small")}>
                            <img src={reduce} />
                        </div>
                        <div className="opacity" style={{fontWeight:"bold"}}>{`${Math.ceil(this.props.scale * 100)}%`}</div>
                        <div className="icon" onClick={() => {this.scale.bind(this)("enlarge")}}>
                            <img src={plus} />
                        </div>
                    </div>
                </div>
                <div className={"box-wrapper"}  style={{right: "80px"}}>
                    <div className={"box " + (this.state.expandPage ? "box-top" : "box-main") } >
                        <div style={{width:"auto", fontWeight:"bold"}}>{this.state.curPage?.displayName}</div>
                        {this.state.otherPages.length > 0 && <div className="icon"
                             onClick={ this.state.expandPage ? () => {this.setState({expandPage: false})} : this.expandPages.bind(this)}>
                            <img src={this.state.expandPage ? up : down} />
                        </div>}
                    </div>
                    { this.state.expandPage &&
                        this.state.otherPages.map((p , i) => {
                            let l = this.state.otherPages.length - 1 === i;
                            return <div className={"box " + (l ? "box-bottom" : "box-mid") } >
                                <div className={"page"}
                                     onClick={()=>this.switchPage.bind(this)(p)}>{p.displayName}</div>
                                </div>
                        })
                    }
                </div>
                <div className={"create-btn box-wrapper"} onClick={this.openCreatePageWindow.bind(this)}>
                    <img src={plus}/>
                </div>
            </div>
                <Modal title="创建新页面" open={this.state.creatingPage}
                       onCancel={() => this.setState({creatingPage:false})}
                       footer={
                    <Button key="copy" onClick={this.createPage.bind(this)}>创 建</Button> }>
                    <Form>
                        <Form.Item name="boardName" initialValue={this.state.newPageName}>
                            <Input className="win-form-input" placeholder="请输入页面名称"
                                   onChange={(e)=>{ this.setState({newPageName:e.target.value})}}/>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        )
    }
}


export default Widget;