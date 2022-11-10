import React from "react";
import "./index.css";
import Background from "../components/Background";
import {Input, Form, Button, message} from "antd";
import {doReset} from "../../api/api";
import {useHistory} from "react-router-dom";

function Reset() {
    const history = useHistory();

    const onFinishreset = (values: any) => {
        console.log(values);
        doReset(values).then((res)=> {
            // localStorage.setItem("token",res.data.token);
            message.success("密码重置成功！")
            history.push("/home")
        });
    }

    return (
        <div className="reset">
            <Background />
            <Form className="form-res" onFinish={onFinishreset}>
                <div className="form-box">
                    <div className="form-title">Reset</div>
                    <div className="form-inputs">
                        <Form.Item name="phone" rules={[
                            {
                                required: false,
                                pattern: new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/, "g"),
                                message: '请输入正确的手机号'
                            }
                        ]}>
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