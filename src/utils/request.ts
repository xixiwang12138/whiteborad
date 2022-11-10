import axios from "axios";
import {message} from "antd";

const request = axios.create({
    timeout: 5000,
    baseURL: "http://175.178.81.93:10300"
});
// request.interceptors.request.use((c)=>{
//     const token = localStorage.getItem("token")
//     if(token) {
//         c.headers = {
//             ...c.headers,
//             authorization: token,
//         };
//     }
//
//     return c;
// });
request.interceptors.response.use((res)=> {
    const user = res.data.user;
    console.log("res data",res.data)
    console.log("状态码",res.status); //状态码
    return res.data;
},(e)=> {
    //错误处理
    console.log(e);
    console.log("res error",e.response.data.error)
    //错误提示
    // message.error(e.message);
    message.error(e.response.data.error);
    return Promise.reject(e); //拦截错误
})






export default request;
