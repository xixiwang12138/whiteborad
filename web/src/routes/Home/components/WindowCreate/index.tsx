import React from "react";
import "./index.css";
import close from "../../icon/close.svg";
import {Input, Form, Button} from "antd";
import {doCreateBoard} from "../../../../api/api";
import {useHistory} from "react-router-dom";

function WindowCreate(){
    const navigate = useHistory();

    const onFinishCreate = async (values: {boardName:string}) => {
        let res = await doCreateBoard(values.boardName);
        navigate.push(`/board/${res.boardId}`);
    }

    return(
        <div className="win-create">
            <div className="window">
                <div style={{marginTop:'15px'}}/>
                <div className="win-top">
                    <div className="win-title">Create</div>
                    <div className="win-close">
                        <img src={close} />
                    </div>
                </div>
                <div style={{marginTop:'40px'}}/>
                <Form onFinish={onFinishCreate}>
                    <div className="win-input">
                        <Form.Item name="boardName">
                            <Input className="input-win" placeholder="请输入白板名称"/>
                        </Form.Item>
                    </div>
                    <div style={{marginTop:'40px'}}/>
                    <div className="win-btn">
                        <Form.Item>
                            <Button className="btn-win" htmlType="submit">创 建</Button>
                        </Form.Item>
                        {/*<div className="btn-win">创 建</div>*/}
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default WindowCreate;