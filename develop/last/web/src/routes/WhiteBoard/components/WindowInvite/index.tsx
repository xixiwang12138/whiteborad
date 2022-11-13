import React, {useState} from "react";
import "./index.css";
import close from "../../../Home/icon/close.svg";
import {Radio} from "antd";
import type {RadioChangeEvent} from "antd";



function WindowInvite() {
    const [value, setValue] = useState(1);
    const onChange = (e: RadioChangeEvent) => {
        setValue(e.target.value);
    };

    return(
        <div className="win-invite">
            <div className="window">
                <div style={{marginTop:'15px'}}/>
                <div className="win-top">
                    <div className="win-title">Invite</div>
                    <div className="win-close">
                        <img src={close} />
                    </div>
                </div>
                <div style={{marginTop:'30px'}}/>
                <div className="invite-info">
                    {/*样式还得改改*/}
                    <div className="info-text">6846218</div>
                    <div className="select-box">
                        <Radio.Group onChange={onChange} value={value}>
                            <Radio value={1}>只 读</Radio>
                            <Radio value={2}>编 辑</Radio>
                        </Radio.Group>
                    </div>
                </div>
                <div style={{marginTop:'20px'}}/>
                <div className="win-btn">
                    <div className="btn-win">复 制</div>
                </div>
            </div>
        </div>
    )
}

export default WindowInvite;