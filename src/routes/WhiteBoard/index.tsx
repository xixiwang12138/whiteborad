import React from "react";
import "./index.css";
import BaseRow from "./components/BaseRow";
import WindowInvite from "./components/WindowInvite";
import ToolList from "./components/ToolList";
import WindowToolBar from "./components/WindowToolBar";


function WhiteBoard() {
    return (
        <div className="board">
            <BaseRow />
            <ToolList />
            {/*<WindowInvite />*/}
            <WindowToolBar />
        </div>
    )
}

export default WhiteBoard;