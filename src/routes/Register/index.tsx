import React, {useState} from "react";
import "./index.css";
import Background from "../components/Background";
import {Input, Form, Button, message} from "antd";
import {useHistory} from "react-router-dom";
import {UserManager} from "../../UserManager";

function Register() {
    const navigate = useHistory();



    const [userPhone, setUserPhone] = useState(" ");
    const [userPassword, setUserPassword] = useState(" ");

    const onFinishRegister = async () => {
        await UserManager.register({
            phone: userPhone,
            password: userPassword
        });
        message.success("账号注册成功！")
        navigate.push(`/home/${await UserManager.getId()}`);
    }

    return (
        <div className="register">
            <Background />
            <Form className="form-reg" onFinish={onFinishRegister}>
                <div className="form-box">
                    <div className="form-title">Join us</div>
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
                            <Input className="input-box" placeholder="请设置密码" onChange={(e) => {setUserPassword(e.target.value);}}/>
                        </Form.Item>
                    </div>
                    <div className="form-tip">
                        <div className="tip-text" onClick={()=>navigate.push('/')}>已有账户？点击登录</div>
                    </div>
                    <div className="form-btns-reg">
                        <Form.Item>
                            <Button className="btn-reg" htmlType={"submit"}>注 册</Button>
                        </Form.Item>
                        {/*<div className="btn-reg" onClick={()=>navigate('/home')}>注 册</div>*/}
                        {/*<div className="btn-login" onClick={()=>navigate('/home')}>登 录</div>*/}
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default Register;