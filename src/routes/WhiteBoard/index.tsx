import React from "react";
import "./index.css";
import BaseRow from "./components/BaseRow";
import WindowInvite from "./components/WindowInvite";
import ToolList from "./components/ToolList";


function WhiteBoard() {
    return (
        <div className="board">
            <BaseRow />
            <ToolList />
            {/*<WindowInvite />*/}
        </div>
    )
}

export default WhiteBoard;