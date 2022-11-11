import React, {useState, useEffect} from "react";
import "./index.css";
import {Button, Form, Input, Modal} from "antd";
import write from "../../icon/编辑名称.svg";
import bin from "../../icon/回收站.svg";
import reset from "../../icon/重置密码.svg";
import logout from "../../icon/退出.svg";
import {UserManager} from "../../../../UserManager";

import {NavLink} from 'react-router-dom';

class BaseColumn extends React.Component {

    state = {
        isNameOpen: false,
        userName: "未命名",
        avatar: "#FFFFFF",
    }

    async componentDidMount() {
        await UserManager.syncUser();
        this.setState({avatar: await UserManager.getAvatar()})
    }

    private rename(e: React.MouseEvent<HTMLElement>) {

    }

    render() {
        return(
            <div className="base-column">
                <div className="column-top">
                    <div className="base-avatar">
                        <div className="avatar" style={{backgroundColor: `#${this.state.avatar}`}}></div>
                    </div>
                    <div style={{marginTop:'10px'}}/>
                    <div className="base-name" onClick={() => this.setState({isNameOpen:true})}>
                        {/*后期加个判断：username是否为空*/}
                        <div className="name" >{this.state.userName}</div>
                        <div className="name-icon">
                            <img src={write}/>
                        </div>
                    </div>
                </div>
                <div className="column-bottom">
                    <div style={{marginTop:'10px'}}/>
                    {/*<div className="bottom-item">*/}
                    {/*    <div className="item-icon">*/}
                    {/*        <img src={bin}/>*/}
                    {/*    </div>*/}
                    {/*    <div className="item-text">回收站</div>*/}
                    {/*</div>*/}
                    <div style={{marginTop:'10px'}}/>
                    <NavLink className="bottom-item" to={"/reset"}>
                        <div className="item-icon">
                            <img src={reset}/>
                        </div>
                        <div className="item-text">重置密码</div>
                    </NavLink>
                    <div style={{marginTop:'10px'}}/>
                    <NavLink className="bottom-item" to={"/"} >
                        <div className="item-icon">
                            <img src={logout}/>
                        </div>
                        <div className="item-text">退出登录</div>
                    </NavLink>
                </div>

                <Modal title=" " open={this.state.isNameOpen}
                       // onOk={() => this.setState({isNameOpen:false})}
                       onCancel={() => this.setState({isNameOpen:false})}
                       footer={
                           <Button key="copy" onClick={this.rename}>确 认</Button>
                       }>
                    {/*<Form.Item name="userName">*/}
                    <Input className="win-form-input" placeholder="请输入昵称" id="username"
                           onChange={(e)=> this.setState({userName: e.target.value})}/>
                    {/*</Form.Item>*/}
                </Modal>

            </div>
        )
    }

}

// function _BaseColumn() {
//     const history = useHistory();
//
//     const ava = UserManager.getAvatar();
//
//     const [isNameOpen, setIsNameOpen] = useState(false);
//     const [userName, setUserName] = useState("未命名");
//
//     const showNameWin = () => {
//         setIsNameOpen(true);
//     }
//     // const onFinishChange = (values: any) => {
//     //     console.log("用户昵称：",values);
//     // }
//
//     const handleChange = async () => {
//
//         setIsNameOpen(false);
//     }
//     const handleNameWinClose = () => {
//         setIsNameOpen(false);
//     }
//
//     return(
//         <div className="base-column">
//             <div className="column-top">
//                 <div className="base-avatar">
//                     <div className="avatar" style={{backgroundColor: `#${ava}`}}></div>
//                 </div>
//                 <div style={{marginTop:'10px'}}/>
//                 <div className="base-name" onClick={showNameWin}>
//                     {/*后期加个判断：username是否为空*/}
//                     <div className="name" >{userName}</div>
//                     <div className="name-icon">
//                         <img src={write}/>
//                     </div>
//                 </div>
//             </div>
//             <div className="column-bottom">
//                 <div style={{marginTop:'10px'}}/>
//                 {/*<div className="bottom-item">*/}
//                 {/*    <div className="item-icon">*/}
//                 {/*        <img src={bin}/>*/}
//                 {/*    </div>*/}
//                 {/*    <div className="item-text">回收站</div>*/}
//                 {/*</div>*/}
//                 <div style={{marginTop:'10px'}}/>
//                 <div className="bottom-item" onClick={()=>history.push('/reset')}>
//                     <div className="item-icon">
//                         <img src={reset}/>
//                     </div>
//                     <div className="item-text">重置密码</div>
//                 </div>
//                 <div style={{marginTop:'10px'}}/>
//                 <NavLink className="bottom-item" onClick={()=>history.push('/')}>
//                     <div className="item-icon">
//                         <img src={logout}/>
//                     </div>
//                     <div className="item-text">退出登录</div>
//                 </NavLink>
//             </div>
//
//             <Modal title=" " open={isNameOpen} onOk={handleChange} onCancel={handleNameWinClose}
//                    footer={
//                        <Button key="copy" onClick={handleChange}>确 认</Button>
//                    }>
//                 {/*<Form.Item name="userName">*/}
//                     <Input className="win-form-input" placeholder="请输入昵称" id="username" onChange={(e)=> {setUserName(e.target.value)}}/>
//                 {/*</Form.Item>*/}
//             </Modal>
//
//         </div>
//     )
// }

export default BaseColumn;