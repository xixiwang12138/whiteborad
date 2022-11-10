import React from "react";
import request from "../utils/request";

interface DataUser{
    phone: string;
    password: string;
}
interface DataJoin{
    boardId: number
}
interface DataCreate{
    boardName: string
}

export function doLogin(admin: any) {
    return request.post<any, any>(
        "/api/user/login",
        admin
    );
}

export function doRegister(admin: any) {
    return request.post<any, any>(
        "/api/user/register",
        admin
    );
}

export function doReset(admin: any) {
    return request.post<any, any>(
        "/api/user/reset",
        admin
    );
}

export function doCreateBoard(admin: any) {
    return request.post<any, any>(
        "/api/board/board",
        admin
    );
}

export function doJoinBoard(admin: any) {
    return request.post<any, any>(
        "/api/board/join",
        admin
    );
}