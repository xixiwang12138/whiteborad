import React from "react";
import "./index.css";
import sort from "../../icon/排序.svg";

function MyBoard(){
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
                        <div className="btn-join">加入白板</div>
                        <div className="btn-create">新增白板</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyBoard;