import React, {useEffect, useState} from "react";
import "./index.css";
import "../../../../App.css";
import home from "../../icon/home.svg";
import file from "../../icon/topimport.svg";
import ex from "../../icon/topexport.svg";
import allDelete from "../../icon/一键清空.svg";
import type {MenuProps}  from "antd";
import attribute from "../../icon/属性选中.svg";
import {Avatar, Tooltip, Dropdown, Button, Modal, Popover, Checkbox, Radio, message} from "antd";
import {NavLink} from 'react-router-dom';
import {UserManager} from "../../../../UserManager";
import {exportFile} from "../../../../api/api";
class BaseRowProps {
    boardInfo:{id:string, name:string}
    memberList:{id:string, name:string, avatar:string}[]
}


class BaseRow extends React.Component<BaseRowProps> {

    state = {
        isCreator: true,
        isInviteOpen: false,
        isExportOpen: false,
        useRadio: 1,
        isExportImage: false,
        exportType: 0,
        fitted: false,
        currentPageId:"",
        avatar: "#956AA4" // TODO 设置默认头像
    }

    async componentDidMount() {
        await UserManager.syncUser();
        this.setState({
            avatar: await UserManager.getAvatar(),
            isCreator: this.props.boardInfo.id === UserManager.getId()
        })
    }

    private async handleCopy(e:React.MouseEvent<HTMLElement>) {
        await navigator.clipboard.writeText(this.props.boardInfo.id);
        message.success("已复制到剪切板");
        this.setState({isInviteOpen:false})
    }
    private async handleExportFile(e:React.MouseEvent<HTMLElement>){
        const pageId = "1591247059763789825"
        const resp = await exportFile(pageId)
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', resp.name);
        document.body.appendChild(link);
        link.click();
        console.log("导出文件")
        this.setState({isExportOpen : false})
    }
    private async handleExportImage(e:React.MouseEvent<HTMLElement>){
        var canvas = document.getElementById("show-canvas");
        var MIME_TYPE = "image/png";
        // @ts-ignore
        var imgURL = canvas.toDataURL(MIME_TYPE);
        var dlLink = document.createElement('a');
        dlLink.download = "画布";
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        this.setState({isExportOpen : false})
    }

    private propertyTool() {
        return (
            <div>
                <Radio.Group onChange={(e) => this.setState({useRadio:e.target.value})}
                             value={this.state.useRadio} style={{display: "flex", flexDirection: "column"}}>
                    <Radio value={1} disabled={!this.state.isCreator}>编辑模式</Radio>
                    <Radio value={2} disabled={!this.state.isCreator}>只读模式</Radio>
                </Radio.Group>
                {/*{this.props.isCreator ?*/}
                {/*    <div>*/}

                {/*    </div> :*/}
                {/*    <div></div>*/}
                {/*}*/}
                <div>
                    <Checkbox onChange={(e) => this.setState({fitted:e.target.value})}>
                        线条拟合
                    </Checkbox>
                </div>
                <div style={{cursor: "pointer"}}><img src={allDelete}/>&nbsp;一键清空</div>
            </div>
        )
    }


    render() {
        return(
            <div className="container">
                <div className="base-row1">
                    <div className="row-left">
                        <div style={{marginLeft:'20px'}}/>
                        <div className="home-icon">
                            <NavLink to="/home">
                                <img src={home} />
                            </NavLink>
                        </div>
                        <div style={{marginLeft:'20px'}}/>
                        <div className="board-name">{this.props.boardInfo.name}</div>
                    </div>
                    <div className="row-middle">
                        <div className="avatar-group">
                            <Avatar.Group maxCount={3} maxStyle={{color: 'white', backgroundColor: '#AD7878'}}>
                                {
                                    this.props.memberList.slice(-3).map((m,i )=> {
                                    return <Tooltip key={i} placement="top" title={m.name}>
                                        <Avatar style={{backgroundColor: `#${this.state.avatar}`,width: "40px", height: "40px", borderRadius: "20px"}}/>
                                    </Tooltip>
                                    })
                                }
                            </Avatar.Group>
                        </div>
                    </div>
                    <div className="row-right">
                        <div className="right1-click">
                            <Popover placement="bottom" content={this.propertyTool.bind(this)} trigger="click">
                                <img src={attribute}/>
                            </Popover>
                            {/*<img src={shuxing}/>*/}
                        </div>
                        <div className="right2">
                            <div className="import-icon" title="导入">
                                <img src={file}/>
                            </div>
                            <div className="export-icon" title="导出">
                                <img src={ex} onClick={()=>this.setState({isExportOpen:true})}/>
                            </div>
                        </div>
                        <div className="right3">
                            <div className="btn-invite" onClick={()=>{this.setState({isInviteOpen:true})}}>邀请</div>
                        </div>
                    </div>
                </div>
                <Modal title="Invite" open={this.state.isInviteOpen}
                       onCancel={() => this.setState({isInviteOpen : false})}
                       footer={<Button key="copy" onClick={this.handleCopy.bind(this)}>复 制</Button> }>
                    {/*<p>SOME</p>*/}
                    <p className="info-text" id="text">{this.props.boardInfo.id}</p>
                    {/*<textarea id="input">copy</textarea>*/}
                </Modal>
                <Modal title="Export" open={this.state.isExportOpen}
                       onCancel={() => this.setState({isExportOpen : false})}
                       footer={<div style={{width: "fit-content", height: "fit-content",
                       display: "flex", flexDirection: "row", alignItems: "center"}}>
                           <Button key="exportFile" onClick={this.handleExportFile.bind(this)}>导出文件</Button>
                           <Button key="exportImage" onClick={this.handleExportImage}>导出图片</Button>
                       </div>
                }>
                    {/*<div>请选择导出类型：</div>*/}
                    {/*<div style={{marginBottom:'10px'}}/>*/}
                    {/*<div>*/}
                    {/*    <Radio.Group onChange={(e) => this.setState({exportType:e.target.value})}*/}
                    {/*                 value={this.state.exportType} style={{display: "flex", flexDirection: "column"}}>*/}
                    {/*        <div style={{display: 'flex', flexDirection: 'row'}}>*/}
                    {/*            <Radio value={0}>文件</Radio>*/}
                    {/*            <Radio value={1} disabled={true}>图片</Radio>*/}
                    {/*        </div>*/}
                    {/*    </Radio.Group>*/}
                    {/*</div>*/}
                </Modal>
            </div>
        )
    }
}


// function _BaseRow(){
//
//     const [isCreateUser, setIsCreateUser] = useState(true);
//     const [isInviteOpen, setIsInviteOpen] = useState(false);
//     const [ava, setAvatar] = useState("") // TODO 使用占位头像
//
//     const showInvite = () => {
//         setIsInviteOpen(true);
//     }
//
//     const handleCopy = () => {
//         setIsInviteOpen(false);
//     }
//
//     const handleInviteClose = () => {
//         setIsInviteOpen(false)
//     }
//
//     const onChangeNihe = (e: CheckboxChangeEvent) => {
//         console.log(`check = ${e.target.checked}`);
//     }
//
//     const [useRadio, setUseRadio] = useState(1)
//     const onChangeQuanxian = (e: RadioChangeEvent) => {
//         console.log('radio checked',e.target.value);
//         setUseRadio(e.target.value);
//     }
//
//     const PropertyTool = (
//         <div>
//             {isCreateUser ?
//                 <div>
//                     <Radio.Group onChange={onChangeQuanxian} value={useRadio} style={{display: "flex", flexDirection: "column"}}>
//                         <Radio value={1}>编辑模式</Radio>
//                         <Radio value={2}>只读模式</Radio>
//                     </Radio.Group>
//                 </div> :
//                 <div></div>
//             }
//             <div>
//                 <Checkbox onChange={onChangeNihe}>线条拟合</Checkbox>
//             </div>
//             <div style={{cursor: "pointer"}}><img src={allDelete}/>&nbsp;一键清空</div>
//         </div>
//     )
//
//     return(
//         <div>
//             <div className="base-row">
//                 <div className="row-left">
//                     <div style={{marginLeft:'20px'}}/>
//                     <div className="home-icon">
//                         <NavLink to="/home">
//                             <img src={home} />
//                         </NavLink>
//                     </div>
//                     <div style={{marginLeft:'20px'}}/>
//                     <div className="board-name">白板名称</div>
//                 </div>
//                 <div className="row-middle">
//                     <div className="avatar-group">
//                         {/*一些逻辑待细化*/}
//                         <Avatar.Group maxCount={3} maxStyle={{color: 'white', backgroundColor: '#AD7878'}}>
//                             <Avatar style={{backgroundColor: `#${ava}`,width: "40px", height: "40px", borderRadius: "20px"}}/>
//                             <Avatar style={{backgroundColor: 'white',width: "40px", height: "40px", borderRadius: "20px"}}/>
//                             <Tooltip placement="top">
//                                 <Avatar style={{backgroundColor:'#87d068',width: "40px", height: "40px", borderRadius: "20px"}}/>
//                             </Tooltip>
//                         </Avatar.Group>
//                     </div>
//                 </div>
//                 <div className="row-right">
//                     <div className="right1-click">
//                         <Popover placement="bottom" content={PropertyTool} trigger="click">
//                             <img src={shuxing}/>
//                         </Popover>
//                         {/*<img src={shuxing}/>*/}
//                     </div>
//                     <div className="right2">
//                         <div className="import-icon" title="导入">
//                             <img src={file}/>
//                         </div>
//                         <div className="export-icon" title="导出">
//                             <img src={ex}/>
//                         </div>
//                     </div>
//                     <div className="right3">
//                         <div className="btn-invite" onClick={showInvite}>邀请</div>
//                     </div>
//                 </div>
//             </div>
//             <Modal title="Invite" open={isInviteOpen} onOk={handleCopy} onCancel={handleInviteClose}
//                    footer={<Button key="copy" onClick={handleCopy}>复 制</Button> }>
//                 {/*<p>SOME</p>*/}
//
//                 <p className="info-text" id="text">白板id</p>
//                 {/*<textarea id="input">copy</textarea>*/}
//             </Modal>
//         </div>
//     )
// }

export default BaseRow;
