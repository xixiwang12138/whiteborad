import React from "react";
import "./index.css";
import Background from "../components/Background";
import {Input, Form} from "antd";
import {useNavigate} from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    return (
        <div className="login">
            <Background />
            <Form className="form-login">
                <div className="form-box">
                    <div className="form-title">Explore with us</div>
                    <div className="form-inputs">
                        <Input className="input-box" placeholder="请输入手机号" />
                        <div style={{marginBottom: '20px'}}/>
                        <Input className="input-box" placeholder="请输入密码" />
                    </div>
                    <div className="form-tip">
                        <div className="tip-text" onClick={()=>navigate('/reset')}>忘记密码？点击重置</div>
                    </div>
                    <div className="form-btns-log">
                        <div className="btn-reg-log" onClick={()=>navigate('/register')}>注 册</div>
                        <div className="btn-login" onClick={()=>navigate('/home')}>登 录</div>
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default Login;