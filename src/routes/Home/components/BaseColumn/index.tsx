import React from "react";
import "./index.css";
import {Avatar} from "antd";
import write from "../../icon/编辑名称.svg";
import bin from "../../icon/回收站.svg";
import reset from "../../icon/重置密码.svg";
import logout from "../../icon/退出.svg";
import {useNavigate} from "react-router-dom";

function BaseColumn() {
    const navigate = useNavigate();
    return(
        <div className="base-column">
            <div className="column-top">
                <div className="base-avatar">
                    {/*<Avatar style={{color:'#9C6262'}}/>*/}
                    {/*avatar没效果？？暂时用div占位*/}
                    <div className="avatar"></div>
                </div>
                <div style={{marginTop:'10px'}}/>
                <div className="base-name">
                    {/*修改名字要不要加弹窗？*/}
                    <div className="name">未命名</div>
                    <div className="name-icon">
                        <img src={write}/>
                    </div>
                </div>
            </div>
            <div className="column-bottom">
                <div style={{marginTop:'10px'}}/>
                <div className="bottom-item">
                    <div className="item-icon">
                        <img src={bin}/>
                    </div>
                    <div className="item-text">回收站</div>
                </div>
                <div style={{marginTop:'10px'}}/>
                <div className="bottom-item" onClick={()=>navigate('/reset')}>
                    <div className="item-icon">
                        <img src={reset}/>
                    </div>
                    <div className="item-text">重置密码</div>
                </div>
                <div style={{marginTop:'10px'}}/>
                <div className="bottom-item" onClick={()=>navigate('/')}>
                    <div className="item-icon">
                        <img src={logout}/>
                    </div>
                    <div className="item-text">退出登录</div>
                </div>
            </div>
        </div>
    )
}

export default BaseColumn;