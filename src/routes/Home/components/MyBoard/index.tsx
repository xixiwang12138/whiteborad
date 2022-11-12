import React, {useState} from "react";
import "./index.css";
import "../../../../App.css";
import sort from "../../icon/排序.svg";
import {Button, Modal, Input, Form, Popover, Tabs} from "antd";
import {doCreateBoard, getCreatedBoards, getJoinedBoards} from "../../../../api/api";
import {useHistory} from "react-router-dom";
import {WhiteBoard} from "../../../WhiteBoard/app/data/WhiteBoard";

const contentStyle: React.CSSProperties = {
    height: "300px",
    backgroundColor: "red",
    width: "850px",
    overflowY: "auto",
    display: "flex",
    flexFlow: "wrap"
}

function MyBoard(){

    const tool = (
        <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.86111 14.2266C3.51322 14.2266 4.13862 13.9675 4.59973 13.5064C5.06084 13.0453 5.31989 12.4199 5.31989 11.7678C5.31989 11.1157 5.06084 10.4903 4.59973 10.0292C4.13862 9.56807 3.51322 9.30902 2.86111 9.30902C2.20901 9.30902 1.58361 9.56807 1.1225 10.0292C0.661392 10.4903 0.402344 11.1157 0.402344 11.7678C0.402344 12.4199 0.661392 13.0453 1.1225 13.5064C1.58361 13.9675 2.20901 14.2266 2.86111 14.2266V14.2266Z" fill="black"/>
            <path d="M12.6951 14.2266C13.3472 14.2266 13.9726 13.9675 14.4337 13.5064C14.8948 13.0453 15.1539 12.4199 15.1539 11.7678C15.1539 11.1157 14.8948 10.4903 14.4337 10.0292C13.9726 9.56807 13.3472 9.30902 12.6951 9.30902C12.043 9.30902 11.4176 9.56807 10.9565 10.0292C10.4954 10.4903 10.2363 11.1157 10.2363 11.7678C10.2363 12.4199 10.4954 13.0453 10.9565 13.5064C11.4176 13.9675 12.043 14.2266 12.6951 14.2266V14.2266Z" fill="black"/>
            <path d="M22.531 9.30902C23.889 9.30902 24.9898 10.4098 24.9898 11.7678C24.9898 13.1257 23.889 14.2266 22.531 14.2266C21.1731 14.2266 20.0723 13.1257 20.0723 11.7678C20.0723 10.4098 21.1731 9.30902 22.531 9.30902Z" fill="black"/>
        </svg>
    )
    const miniBoard = (boardName: string, bId: string) => {
        return (
            <div className="mini-board-container" >
                <div className="mini-board-box" style={{ cursor: "pointer" }} id={bId} onClick={(e)=> handleClickJoin(e)}>
                    <div className="mini-board-tool">
                        <Popover placement="top" content={MiniBoardTool} trigger="hover">
                            {/*<Button>tool</Button>*/}
                            <div className="tool-icon" id="toolbtn">
                                {tool}
                            </div>
                        </Popover>
                    </div>
                </div>
                <div className="mini-board-name">{boardName}</div>
            </div>
        )
    }
    const creatListDiv = []
    const joinListDiv = []
    const allListDiv = []

    const createBoardList = []
    const joinBoardList = []
    const allList = []

    //请求获取board列表
    const loadMyCreatList = async () => {
        const c = await getCreatedBoards()
        c.forEach((board) => {
            createBoardList.push(board)
            creatListDiv.push(
                miniBoard(board.name, board.id)
            )
        })
    }

    const loadMyJoinList = async () => {
        const c = await getJoinedBoards()
        c.forEach((board) => {
            joinBoardList.push(board)
            joinListDiv.push(
                miniBoard(board.name, board.id)
            )
        })
    }

    const getAllList = () => {
        const c = createBoardList.concat(joinBoardList)
        c.forEach((board) => {
            allList.push(c)
            allListDiv.push(
                miniBoard(board.name, board.id)
            )
        })
    }

    const refreshList = async () => {
        await loadMyCreatList()
        await loadMyJoinList()
        await getAllList()
    }


    const onTabsChange = (key: string) => {
        switch (key) {
            case '1': {
                refreshList().then();
                break;
            }
            case '2':{
                loadMyCreatList().then()
                break;
            }
            case '3':{
                loadMyJoinList().then();
                break;
            }
        }
    }


    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [boardName, setBoardName] = useState(" ");
    const [boardIdToJoin, setBoardIdToJoin] = useState("")
    const navigate = useHistory();

    const showCreate = () => {
        setIsCreateOpen(true);
    }
    const showJoin =() => {
        setIsJoinOpen(true);
    }

    const handleCreate = async (values:any) => {
        setIsCreateOpen(false)
        let res = await doCreateBoard(boardName);
        navigate.push(`/board/${res.boardId}`);
    }
    const handleJoin = () => {
        setIsJoinOpen(false)
        navigate.push(`/board/${boardIdToJoin}`)
    }

    const handleCreateClose = () => {
        setIsCreateOpen(false)
    }
    const handleJoinClose = () => {
        setIsJoinOpen(false)
    }


    const handleClickJoin = (e) => {
        const boardId =  e.target.id;
        navigate.push(`/board/${boardId}`);
    }


    const MiniBoardTool = (
        <div>
            <div className="tool-content">邀请成员</div>
            <div className="tool-content">删除白板</div>
            <div className="tool-content">导出</div>
        </div>
    )


    refreshList().then();
    console.log("allListDiv:",allListDiv)
    console.log("createListDiv:",creatListDiv)
    console.log("joinListDiv:",joinListDiv)
    const AllBoard = <div className="board-container"> {allListDiv}</div>
    const MyCreate = <div className="board-container"> {creatListDiv}</div>
    const MyJoin = <div className="board-container"> {joinListDiv}</div>
    // const LikeBoard = <div className="board-container">这里是收藏白板</div>

    return(
        <div className="my-board">
            <div className="contain">
                <div className="title">我的白板</div>
                <div style={{marginBottom:'20px'}}/>
                <div className="list">
                    <div className="list-left">
                        <Tabs onChange={onTabsChange} defaultActiveKey="4"
                        items={[
                            {
                                label: `全部白板`,
                                key: '1',
                                children: AllBoard,
                            },
                            {
                                label: `我创建的`,
                                key: '2',
                                children: MyCreate
                            },
                            {
                                label: `我参与的`,
                                key: '3',
                                children: MyJoin
                            },
                            {
                                label: `我的收藏`,
                                key: '4',
                                children: "功能尚未开启，请耐心等待",
                            }
                        ]}/>
                        {/*<div className="left-box"><span className="box-text">全部白板</span></div>*/}
                        {/*<div className="left-box"><span className="box-text">我创建的</span></div>*/}
                        {/*<div className="left-box"><span className="box-text">我参与的</span></div>*/}
                        {/*<div className="left-box"><span className="box-text">收藏白板</span></div>*/}
                    </div>
                    {/*<div className="list-right">*/}
                    {/*    <div className="right-icon">*/}
                    {/*        <img src={sort}/>*/}
                    {/*    </div>*/}
                    {/*    <div className="right-box">访问时间</div>*/}
                    {/*</div>*/}
                </div>
                <div style={{marginBottom:'20px'}}/>
                <div style={{width: '1000px', height: '400px'}}></div>
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
                        <Input className="win-form-input" placeholder="请输入序列号" onChange={(e)=>{setBoardIdToJoin(e.target.value);}}/>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="Create" open={isCreateOpen} onOk={handleCreate} onCancel={handleCreateClose}
                   footer={<Button key="copy" onClick={handleCreate}>创 建</Button> }>
                <Form>
                    <Form.Item name="boardName">
                        <Input className="win-form-input" placeholder="请输入白板名称" onChange={(e)=>{setBoardName(e.target.value);}}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default MyBoard;
