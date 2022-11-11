import React, {useEffect, useState} from "react";
import "./index.css";
import "../../../../App.css";
import home from "../../icon/home.svg";
import file from "../../icon/导入文件.svg";
import ex from "../../icon/导出.svg";
import allDelete from "../../icon/一键清空.svg";

// import list from "../../icon/属性-收起.svg"; 这个用不了，先用下面的顶替
import type {MenuProps}  from "antd";
import attribute from "../../icon/属性选中.svg";
import {Avatar, Tooltip, Dropdown, Button, Modal, Popover, Checkbox, Radio, message} from "antd";
import {NavLink} from 'react-router-dom';
import {UserManager} from "../../../../UserManager";
import {exportFile} from "../../../../api/api";

class BaseRowProps {
    isCreator:boolean = false;
}


class BaseRow extends React.Component<BaseRowProps> {

    state = {
        isCreateUser: true,
        isInviteOpen: false,
        isExportOpen: false,
        useRadio: 1,
        isExportImage: 0,
        fitted: false,
        avatar: "#956AA4" // TODO 设置默认头像
    }

    async componentDidMount() {
        await UserManager.syncUser();
        this.setState({avatar:await UserManager.getAvatar()})
    }

    private handleCopy(e:React.MouseEvent<HTMLElement>) {
        // TODO 获取内容
    }

    private handleExport(e:React.MouseEvent<HTMLElement>){
        if(this.state.isExportImage) {
            console.log("导出图片")
        }else {
            console.log("导出文件")
        }

    }

    private propertyTool() {
        return (
            <div>
                {this.props.isCreator ?
                    <div>
                        <Radio.Group onChange={(e) => this.setState({useRadio:e.target.value})}
                                     value={this.state.useRadio} style={{display: "flex", flexDirection: "column"}}>
                            <Radio value={1}>编辑模式</Radio>
                            <Radio value={2}>只读模式</Radio>
                        </Radio.Group>
                    </div> :
                    <div></div>
                }
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
            <div>
                <div className="base-row">
                    <div className="row-left">
                        <div style={{marginLeft:'20px'}}/>
                        <div className="home-icon">
                            <NavLink to="/home">
                                <img src={home} />
                            </NavLink>
                        </div>
                        <div style={{marginLeft:'20px'}}/>
                        <div className="board-name">白板名称</div>
                    </div>
                    <div className="row-middle">
                        <div className="avatar-group">
                            {/*一些逻辑待细化*/}
                            <Avatar.Group maxCount={3} maxStyle={{color: 'white', backgroundColor: '#AD7878'}}>
                                <Avatar style={{backgroundColor: `#${this.state.avatar}`,width: "40px", height: "40px", borderRadius: "20px"}}/>
                                <Avatar style={{backgroundColor: 'white',width: "40px", height: "40px", borderRadius: "20px"}}/>
                                <Tooltip placement="top">
                                    <Avatar style={{backgroundColor:'#87d068',width: "40px", height: "40px", borderRadius: "20px"}}/>
                                </Tooltip>
                            </Avatar.Group>
                        </div>
                    </div>
                    <div className="row-right">
                        <div className="right1-click">
                            <Popover placement="bottom" content={this.propertyTool} trigger="click">
                                <img src={attribute}/>
                            </Popover>
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
                <Modal title="Invite" open={this.state.isInviteOpen} onOk={this.handleCopy}
                       onCancel={() => this.setState({isInviteOpen : false})}
                       footer={<Button key="copy" onClick={this.handleCopy}>复 制</Button> }>
                    {/*<p>SOME</p>*/}
                    <p className="info-text" id="text">白板id</p>
                    {/*<textarea id="input">copy</textarea>*/}
                </Modal>
                <Modal title="Export" open={this.state.isExportOpen} onOk={this.handleExport}
                       onCancel={() => this.setState({isExportOpen : false})}
                       footer={<Button key="copy" onClick={this.handleExport}>导 出</Button> }>
                    <div>请选择导出类型：</div>
                    <div style={{marginBottom:'10px'}}/>
                    <div>
                        <Radio.Group onChange={(e) => this.setState({exportType:e.target.value})}
                                     value={this.state.isExportImage} style={{display: "flex", flexDirection: "column"}}>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <Radio value={0}>文件</Radio>
                                <Radio value={1} disabled={true}>图片</Radio>
                            </div>
                        </Radio.Group>
                    </div>
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