import React from "react";
import "./index.css";
import Background from "../components/Background";
import {Input, Form} from "antd";
import {useNavigate} from "react-router-dom";

function Reset() {
    const navigate = useNavigate();
    return (
        <div className="reset">
            <Background />
            <Form className="form-res">
                <div className="form-box">
                    <div className="form-title">Reset</div>
                    <div className="form-inputs">
                        <Input className="input-box" placeholder="请输入手机号" />
                        <div style={{marginBottom: '20px'}}/>
                        <Input className="input-box" placeholder="请重置密码" />
                    </div>
                    <div className="form-btns-res">
                        <div className="btn-ver" onClick={()=>navigate('/')}>确 定</div>
                        {/*<div className="btn-login" onClick={()=>navigate('/home')}>登 录</div>*/}
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default Reset;