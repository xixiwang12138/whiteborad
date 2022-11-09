import React, {useState} from "react";
import "./index.css";
// import "../../../../App.css";
import home from "../../icon/home.svg";
import file from "../../icon/导入文件.svg";
import ex from "../../icon/导出.svg";
import {useNavigate} from "react-router-dom";

// import list from "../../icon/属性-收起.svg"; 这个用不了，先用下面的顶替
import type {MenuProps}  from "antd";
import shuxing from "../../icon/属性选中.svg";
import {Avatar, Tooltip, Dropdown, Button, Modal} from "antd";
import {Simulate} from "react-dom/test-utils";
import input = Simulate.input;



function BaseRow(){

    const navigate = useNavigate();

    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const showInvite = () => {
        setIsInviteOpen(true);
    }

    const handleCopy = () => {
        setIsInviteOpen(false);
    }

    const handleInviteClose = () => {
        setIsInviteOpen(false)
    }

    return(
        <div>
            <div className="base-row">
                <div className="row-left">
                    <div style={{marginLeft:'20px'}}/>
                    <div className="home-icon">
                        <img src={home} onClick={()=>navigate('/home')}/>
                    </div>
                    <div style={{marginLeft:'20px'}}/>
                    <div className="board-name">白板名称</div>
                </div>
                <div className="row-middle">
                    <div className="avatar-group">
                        {/*一些逻辑待细化*/}
                        <Avatar.Group maxCount={3} maxStyle={{color: 'white', backgroundColor: '#AD7878'}}>
                            <Avatar style={{backgroundColor: '#dbff92',width: "40px", height: "40px", borderRadius: "20px"}}/>
                            <Avatar style={{backgroundColor: 'white',width: "40px", height: "40px", borderRadius: "20px"}}/>
                            <Tooltip placement="top">
                                <Avatar style={{backgroundColor:'#87d068',width: "40px", height: "40px", borderRadius: "20px"}}/>
                            </Tooltip>
                        </Avatar.Group>
                    </div>
                </div>
                <div className="row-right">
                    <div className="right1">
                        <img src={shuxing}/>
                    </div>
                    <div className="right2">
                        <div className="import-icon">
                            <img src={file}/>
                        </div>
                        <div className="export-icon">
                            <img src={ex}/>
                        </div>
                    </div>
                    <div className="right3">
                        <div className="btn-invite" onClick={showInvite}>邀请</div>
                    </div>
                </div>
            </div>
            <Modal title="Invite" open={isInviteOpen} onOk={handleCopy} onCancel={handleInviteClose}
                   footer={<Button key="copy" onClick={handleCopy}>复 制</Button> }>
                {/*<p>SOME</p>*/}

                <p className="info-text" id="text">白板id</p>
                {/*<textarea id="input">copy</textarea>*/}
            </Modal>
        </div>
    )
}

export default BaseRow;