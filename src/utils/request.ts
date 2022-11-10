import axios, {AxiosError} from "axios";
import {message} from "antd";

const request = axios.create({
    timeout: 5000,
    baseURL: "http://175.178.81.93:10300"
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
    return res.data.data;
},(e:AxiosError)=> {
    const resp = e.response.data as ErrorResponse;
    if(resp) {
        message.error(resp.error).then();
    } else {
        message.error(e.message).then(); //错误提示
    }
    return Promise.reject(e); //拦截错误
})


export default request;