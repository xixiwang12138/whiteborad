import React, {useState} from "react";
import "./index.css";
import {Button, Form, Input, Modal} from "antd";
import write from "../../icon/编辑名称.svg";
import bin from "../../icon/回收站.svg";
import reset from "../../icon/重置密码.svg";
import logout from "../../icon/退出.svg";
import {useNavigate} from "react-router-dom";

function BaseColumn() {
    const navigate = useNavigate();

    const [isNameOpen, setIsNameOpen] = useState(false);
    const [userName, setUserName] = useState("未命名");
    const showNameWin = () => {
        setIsNameOpen(true);
    }
    // const onFinishChange = (values: any) => {
    //     console.log("用户昵称：",values);
    // }
    const handleChange = () => {

        setIsNameOpen(false);
    }
    const handleNameWinClose = () => {
        setIsNameOpen(false);
    }

    return(
        <div className="base-column">
            <div className="column-top">
                <div className="base-avatar">
                    {/*简单点的话那就头像统一颜色就好，复杂的话，登录/注册/重置返回数据中还要有系统随机生成的颜色*/}
                    <div className="avatar" style={{backgroundColor: "#9C6262"}}></div>
                </div>
                <div style={{marginTop:'10px'}}/>
                <div className="base-name" onClick={showNameWin}>
                    {/*后期加个判断：username是否为空*/}
                    <div className="name">{userName}</div>
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
                <div className="bottom-item" onClick={()=>navigate('/reset')}>
                    <div className="item-icon">
                        <img src={reset}/>
                    </div>
                    <div className="item-text">重置密码</div>
                </div>
                <div style={{marginTop:'10px'}}/>
                <div className="bottom-item" onClick={()=>navigate('/')}>
                    <div className="item-icon">
                        <img src={logout}/>
                    </div>
                    <div className="item-text">退出登录</div>
                </div>
            </div>

            <Modal title=" " open={isNameOpen} onOk={handleChange} onCancel={handleNameWinClose}
                   footer={
                       <Button key="copy" onClick={handleChange}>确 认</Button>
                   }>
                {/*<Form.Item name="userName">*/}
                    <Input className="win-form-input" placeholder="请输入昵称" id="username"/>
                {/*</Form.Item>*/}
            </Modal>

        </div>
    )
}

export default BaseColumn;