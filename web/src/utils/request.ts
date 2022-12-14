import axios, {AxiosError} from "axios";
import {message} from "antd";
const host = "https://www.amarobot.site:10300";
// const host = "http://localhost:10300";
// const host = "http://192.168.137.17:10300";
// const host = "http://175.178.81.93:10300"
// const host = "http://172.21.216.71:10300";


const request = axios.create({
    timeout: 5000,
    baseURL: host
});

type Response = {
    code:number,
    data:any
}

type ErrorResponse = {
    code:number
    error:string,
}

request.interceptors.request.use((c)=>{
    // TODO 可能需要urlencode
    const token = localStorage.getItem("token")
    if(token) {
        c.headers = {
            ...c.headers,
            token: token,
        };
    }
    return c;
});

request.interceptors.response.use((res)=> {
    // console.log("打印：",res.data.data)
    return res.data.data;
},(e:AxiosError)=> {
    const resp = e.response?.data as ErrorResponse;
    if(resp) {
        if(resp.code === 100003){
            window.location.replace("/")
        }
        message.error(resp.error).then();
    } else {
        message.error(e.message).then(); //错误提示
    }
    return Promise.reject(e); //拦截错误
})


export default request;
