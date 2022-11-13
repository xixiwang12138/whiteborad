import React from "react";
import "./index.css";
import WindowJoin from "./components/WindowJoin";
import WindowCreate from "./components/WindowCreate";
import BaseColumn from "./components/BaseColumn";
import MyBoard from "./components/MyBoard";

function Home() {
    return (
        <div className="home" style={{width:"100%", height:"100%"}}>
            <BaseColumn />
            <MyBoard />
            {/*<WindowJoin />*/}
            {/*<WindowCreate />*/}
        </div>
    )
}

export default Home;