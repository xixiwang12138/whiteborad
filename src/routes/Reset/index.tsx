import React, {useState} from "react";
import "./index.css";
import Background from "../components/Background";
import {Input, Form, Button} from "antd";
import {useNavigate} from "react-router-dom";
import {doReset} from "../../api/api";

function Reset() {
    const navigate = useNavigate();

    const onFinishreset = (values: any) => {
        console.log(values);
        doReset(values).then((res)=> {
            if(res.success){
                localStorage.setItem("token",res.data.token);
                navigate('/home');
                console.log("数据：",res.data)
            }else {
                console.log(res.errorMessage);
            }
        });
    }



    return (
        <div className="reset">
            <Background />
            <Form className="form-res" onFinish={onFinishreset}>
                <div className="form-box">
                    <div className="form-title">Reset</div>
                    <div className="form-inputs">
                        <Form.Item name="phone">
                            <Input className="input-box" placeholder="请输入手机号" />
                        </Form.Item>
                        <div style={{marginBottom: '20px'}}/>
                        <Form.Item name="password">
                            <Input className="input-box" placeholder="请重置密码" />
                        </Form.Item>
                    </div>
                    <div className="form-btns-res">
                        <Form.Item>
                            <Button className="btn-ver" htmlType="submit">确 定</Button>
                        </Form.Item>
                        {/*<div className="btn-ver" onClick={()=>navigate('/')}>确 定</div>*/}
                        {/*<div className="btn-login" onClick={()=>navigate('/home')}>登 录</div>*/}
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default Reset;