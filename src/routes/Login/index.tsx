import React, {useState} from "react";
import "./index.css";
// import "../../App.css";
import Background from "../components/Background";
import {Input, Form, Button, message} from "antd";
import {useHistory} from "react-router-dom";
import {doLogin} from "../../api/api";
import {UserManager} from "../../UserManager";

function Login() {
    const navigate = useHistory();

    const [userPhone, setUserPhone] = useState(" ");
    const [userPassword, setUserPassword] = useState(" ");

    const onFinishlogin = async () => {
        await UserManager.login({
            phone: userPhone,
            password: userPassword
        });
        message.success("登录成功！")
        navigate.push(`/home/${UserManager.getId()}`);
    }

    return (
        <div className="login">
            <Background />
            <Form className="form-login" onFinish={onFinishlogin}>
                <div className="form-box">
                    <div className="form-title">Explore with us</div>
                    <div className="form-inputs">
                        <Form.Item name="phone" rules={[
                            {
                                required: false,
                                pattern: new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/, "g"),
                                message: '请输入正确的手机号'
                            }
                        ]}>
                            <Input className="input-box" placeholder="请输入手机号" onChange={(e)=>{setUserPhone(e.target.value);}}/>
                        </Form.Item>
                        <div style={{marginBottom: '20px'}}/>
                        <Form.Item name="password">
                            <Input className="input-box" placeholder="请输入密码" onChange={(e) => {setUserPassword(e.target.value);}}/>
                        </Form.Item>
                    </div>
                    <div className="form-tip">
                        <div className="tip-text" onClick={()=>navigate.push('/reset')}>忘记密码？点击重置</div>
                    </div>
                    <div className="form-btns-log">
                        <Form.Item>
                            <Button className="btn-reg-log" onClick={()=>navigate.push('/register')}>注 册</Button>
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