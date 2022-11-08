import React from "react";
import request from "../utils/request";

interface DataLogin {
    phone: string;
    password: string;
}

export function doLogin(admin: DataLogin) {
    return request.post<any, ResponseSuccess<{token: string}>>(
        "/api/user/login",
        admin
    );
}

export function doRegister(admin: any) {
    return request.post<any, ResponseSuccess<{token: string}>>(
        "/api/user/register",
        admin
    );
}

export function doReset(admin: any) {
    return request.post<any, ResponseSuccess<{token: string}>>(
        "/api/user/reset",
        admin
    );
}

export function doCreateBoard(admin: any) {
    return request.post<any, ResponseSuccess<{token: string}>>(
        "/api/board/board",
        admin
    );
}

export function doJoinBoard(admin: any) {
    return request.post<any, ResponseSuccess<{token: string}>>(
        "/api/board/join",
        admin
    );
}