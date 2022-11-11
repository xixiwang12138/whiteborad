import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Reset from "./routes/Reset";
import WhiteBoard from "./routes/WhiteBoard";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <BrowserRouter>
        <Switch>
            <Route path="/reset" component={Reset} />
            <Route path="/register" component={Register} />
            <Route path="/home" component={Home} />
            <Route path="/board/:id" component={WhiteBoard} />
            <Route path="/" component={Login} />
        </Switch>
    </BrowserRouter>
)

// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
