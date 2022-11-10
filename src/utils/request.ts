import axios from "axios";
import {message} from "antd";

const request = axios.create({
    timeout: 5000,
    baseURL: "http://175.178.81.93:10300"
});
request.interceptors.request.use((c)=>{
    const token = localStorage.getItem("token")
    if(token) {
        c.headers = {
            ...c.headers,
            authorization: token,
        };
    }

    return c;
});
request.interceptors.response.use((res)=> {
    console.log(res.status); //状态码
    return res.data;
},(e)=> {
    //错误处理
    console.log(e);
    message.error(e.message); //错误提示
    return Promise.reject(e); //拦截错误
})






export default request;