import React, {useState} from "react";
import "./index.css";
// import "../../App.css";
import Background from "../components/Background";
import {Input, Form, Button, message} from "antd";
import {useNavigate} from "react-router-dom";
import {doLogin} from "../../api/api";

function Login() {
    const navigate = useNavigate();

    const onFinishlogin = (values: any) => {
        console.log("login form:",values);
        doLogin(values).then((res)=> {

            if(res.success){
                localStorage.setItem("token",res.data.token);
                navigate('/home');
            }else {
                console.log(res.errorMessage);
            }
        });
    }

    return (
        <div className="login">
            <Background />
            <Form className="form-login" onFinish={onFinishlogin}>
                <div className="form-box">
                    <div className="form-title">Explore with us</div>
                    <div className="form-inputs">
                        <Form.Item name="phone">
                            <Input className="input-box" placeholder="请输入手机号" />
                        </Form.Item>
                        <div style={{marginBottom: '20px'}}/>
                        <Form.Item name="password">
                            <Input className="input-box" placeholder="请输入密码" />
                        </Form.Item>
                    </div>
                    <div className="form-tip">
                        <div className="tip-text" onClick={()=>navigate('/reset')}>忘记密码？点击重置</div>
                    </div>
                    <div className="form-btns-log">
                        <Form.Item>
                            <Button className="btn-reg-log" onClick={()=>navigate('/register')}>注 册</Button>
                        </Form.Item>
                        <Form.Item>
                            <Button className="btn-login" htmlType="submit">登 录</Button>
                        </Form.Item>
                        {/*<div className="btn-reg-log" onClick={()=>navigate('/register')}>注 册</div>*/}
                        {/*<div className="btn-login" onClick={()=>navigate('/home')}>登 录</div>*/}
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default Login;