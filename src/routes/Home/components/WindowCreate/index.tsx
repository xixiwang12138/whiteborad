import React from "react";
import "./index.css";
import close from "../../icon/close.svg";
import {Input, Form} from "antd";

function WindowCreate(){
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
                <Form>
                    <div className="win-input">
                        <Input className="input-win" placeholder="请输入白板名称"/>
                    </div>
                    <div style={{marginTop:'40px'}}/>
                    <div className="win-btn">
                        <div className="btn-win">创 建</div>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default WindowCreate;