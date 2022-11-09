import React, {useState} from "react";
import "./index.css";
import "../../../../App.css";
import sort from "../../icon/排序.svg";
import {Button, Modal, Input, Form} from "antd";

function MyBoard(){

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    const showCreate = () => {
        setIsCreateOpen(true);
    }
    const showJoin =() => {
        setIsJoinOpen(true);
    }

    const handleCreate = () => {
        setIsCreateOpen(false)
    }
    const handleJoin = () => {
        setIsJoinOpen(false)
    }

    const handleCreateClose = () => {
        setIsCreateOpen(false)
    }
    const handleJoinClose = () => {
        setIsJoinOpen(false)
    }

    return(
        <div className="my-board">
            <div className="contain">
                <div className="title">我的白板</div>
                <div style={{marginBottom:'20px'}}/>
                <div className="list">
                    <div className="list-left">
                        <div className="left-box"><span className="box-text">全部白板</span></div>
                        <div className="left-box"><span className="box-text">我创建的</span></div>
                        <div className="left-box"><span className="box-text">我参与的</span></div>
                        <div className="left-box"><span className="box-text">收藏白板</span></div>
                    </div>
                    <div className="list-right">
                        {/*访问时间这里改成排序吧，就不要筛选了*/}
                        <div className="right-icon">
                            <img src={sort}/>
                        </div>
                        <div className="right-box">访问时间</div>
                    </div>
                </div>
                <div style={{marginBottom:'20px'}}/>
                <div className="board-container">
                    antd：Grid栅格、Space间距、Dropdown下拉菜单
                </div>
                <div style={{marginBottom:'20px'}}/>
                <div className="contain-btns">
                    <div className="btns">
                        <div className="btn-join" onClick={showJoin}>加入白板</div>
                        <div className="btn-create" onClick={showCreate}>新增白板</div>
                    </div>
                </div>
            </div>

            <Modal title="Join" open={isJoinOpen} onOk={handleJoin} onCancel={handleJoinClose}
                   footer={<Button key="copy" onClick={handleJoin}>加 入</Button> }>
                <Form>
                    <Form.Item name="boardId">
                        <Input className="win-form-input" placeholder="请输入序列号"/>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="Create" open={isCreateOpen} onOk={handleCreate} onCancel={handleCreateClose}
                   footer={<Button key="copy" onClick={handleCreate}>创 建</Button> }>
                <Form>
                    <Form.Item name="boardName">
                        <Input className="win-form-input" placeholder="请输入白板名称"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default MyBoard;