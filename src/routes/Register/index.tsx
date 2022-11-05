import React from "react";
import "./index.css";
import Background from "../components/Background";
import {Input, Form} from "antd";
import {useNavigate} from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    return (
        <div className="register">
            <Background />
            <Form className="form-reg">
                <div className="form-box">
                    <div className="form-title">Join us</div>
                    <div className="form-inputs">
                        <Input className="input-box" placeholder="请输入手机号" />
                        <div style={{marginBottom: '20px'}}/>
                        <Input className="input-box" placeholder="请设置密码" />
                    </div>
                    <div className="form-tip">
                        <div className="tip-text" onClick={()=>navigate('/')}>已有账户？点击登录</div>
                    </div>
                    <div className="form-btns-reg">
                        <div className="btn-reg" onClick={()=>navigate('/home')}>注 册</div>
                        {/*<div className="btn-login" onClick={()=>navigate('/home')}>登 录</div>*/}
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default Register;