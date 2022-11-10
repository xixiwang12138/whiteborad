import React from "react";
import request from "../utils/request";
import {WhiteBoard} from "../routes/WhiteBoard/app/data/WhiteBoard";
import {DataLoader} from "../utils/data/DataLoader";
import {UserInfo} from "../UserManager";

export type LoginForm = {
    phone: string;
    password: string;
}

export type LoginResp = {
    token: string;
    user: UserInfo
}

export async function doLogin(form: LoginForm) {
    return request.post<any, LoginResp>(
        "/api/user/login",
        form
    );
}

export type RegisterForm = LoginForm;

type RegisterResp = LoginResp;

export async function doRegister(form: RegisterForm) {
    return request.post<any, RegisterResp>(
        "/api/user/register",
        form
    );
}

export function doReset(form: RegisterForm) {
    return request.post<any, ResponseSuccess<{token: string}>>(
        "/api/user/reset",
        form
    );
}

type CreateBoardResp = {
    boardId:number
}

export function doCreateBoard(boardName:string) {
    return request.post<any, CreateBoardResp>(
        "/api/board/board",
        {boardName}
    );
}

export async function joinBoard(boardId: number):Promise<WhiteBoard> {
    let res = await request.post<any, {board:WhiteBoard}>(
        "/api/board/join",
        {boardId}
    );
    return DataLoader.load(WhiteBoard, res.board);
}