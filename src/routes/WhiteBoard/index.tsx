import React from "react";
import "./index.css";
import BaseRow from "./components/BaseRow";
import WindowInvite from "./components/WindowInvite";


function WhiteBoard() {
    return (
        <div className="board">
            <BaseRow />
            {/*<WindowInvite />*/}
        </div>
    )
}

export default WhiteBoard;