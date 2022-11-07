import React from "react";
import "./index.css";
import Background from "../components/Background";
import {Input, Form, Button} from "antd";
import {useNavigate} from "react-router-dom";
import {doRegister} from "../../api/api";

function Register() {
    const navigate = useNavigate();

    const onFinishregister = (values: any) => {
        doRegister(values).then((res) => {
            if(res.success){
                localStorage.setItem("token",res.data.token);
                navigate('/home');
            }else {
                console.log(res.errorMessage);
            }
        });
    }

    return (
        <div className="register">
            <Background />
            <Form className="form-reg" onFinish={onFinishregister}>
                <div className="form-box">
                    <div className="form-title">Join us</div>
                    <div className="form-inputs">
                        <Form.Item name="phone">
                            <Input className="input-box" placeholder="请输入手机号" />
                        </Form.Item>
                        <div style={{marginBottom: '20px'}}/>
                        <Form.Item name="password">
                            <Input className="input-box" placeholder="请设置密码" />
                        </Form.Item>
                    </div>
                    <div className="form-tip">
                        <div className="tip-text" onClick={()=>navigate('/')}>已有账户？点击登录</div>
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