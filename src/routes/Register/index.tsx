import React, {useState} from "react";
import "./index.css";
import Background from "../components/Background";
import {Input, Form, Button} from "antd";
import {useNavigate} from "react-router-dom";
import {doRegister} from "../../api/api";
import axios from "axios";

function Register() {
    const navigate = useNavigate();

    const onFinishregister = (values: any) => {
        doRegister(values).then((res) => {
            if(res.success){
                localStorage.setItem("token",res.data.token);
                navigate('/home');
            }else {
                console.log("data form",res.errorMessage);
            }
        });
    }

    const [userPhone, setUserPhone] = useState(" ");
    const [userPassword, setUserPassword] = useState(" ");
    const onDoRegister = () => {
        axios.post('http://175.178.81.93:10300/api/user/register',{
            params: {
                phone: userPhone,
                password: userPassword
            }
        }).catch(function (error){
            console.log("register error", error)
        })
    }

    return (
        <div className="register">
            <Background />
            <Form className="form-reg" onFinish={onFinishregister}>
                <div className="form-box">
                    <div className="form-title">Join us</div>
                    <div className="form-inputs">
                        <Form.Item name="phone">
                            <Input className="input-box" placeholder="请输入手机号" onChange={(e)=>{setUserPhone(e.target.value);}}/>
                        </Form.Item>
                        <div style={{marginBottom: '20px'}}/>
                        <Form.Item name="password">
                            <Input className="input-box" placeholder="请设置密码" onChange={(e) => {setUserPassword(e.target.value);}}/>
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