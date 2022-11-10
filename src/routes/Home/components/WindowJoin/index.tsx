import React from "react";
import "./index.css";
import close from "../../icon/close.svg";
import {Input, Form, Button} from "antd";

function WindowJoin(){

    const onFinishJoin = (values: any) => {
        // doJoinBoard(values).then((res)=> {
        //     if(res.success){
        //         localStorage.setItem("token",res.data.token);
        //     }else {
        //         console.log(res.errorMessage);
        //     }
        // })
    }

    return(
        <div className="win-join">
            <div className="window">
                <div style={{marginTop:'15px'}}/>
                <div className="win-top">
                    <div className="win-title">Join</div>
                    <div className="win-close">
                        <img src={close} />
                    </div>
                </div>
                <div style={{marginTop:'40px'}}/>
                <Form onFinish={onFinishJoin}>
                    <div className="win-input">
                        <Form.Item name="boardId">
                            <Input className="input-win" placeholder="请输入序列号"/>
                        </Form.Item>
                    </div>
                    <div style={{marginTop:'40px'}}/>
                    <div className="win-btn">
                        <Form.Item>
                            <Button className="btn-win" htmlType="submit">加 入</Button>
                        </Form.Item>
                        {/*<div className="btn-win">加 入</div>*/}
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default WindowJoin;