import React from "react";
import request from "../utils/request";
import {WhiteBoard} from "../routes/WhiteBoard/app/data/WhiteBoard";
import {DataLoader} from "../utils/data/DataLoader";
import {UserInfo} from "../UserManager";
import {Page} from "../routes/WhiteBoard/app/data/Page";
import {BoardMode} from "../routes/WhiteBoard";

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

export async function getUserInfo():Promise<UserInfo> {
    return (await request.get<any, {user:UserInfo}>(
        "/api/user/info"
    )).user;
}

type ResetForm = RegisterForm;
export async function doReset(form: ResetForm) {
    return request.post<any, null>(
        "/api/user/reset",
        form
    );
}

type CreateBoardResp = {
    boardId:string
}

export function doCreateBoard(boardName:string) {
    return request.post<any, CreateBoardResp>(
        "/api/board/board",
        {boardName}
    );
}

export function switchMode(boardId:string, mode: BoardMode) {
    return request.post<any, null>(
        "/api/board/switchMode",
        {boardId, mode}
    );
}

export async function joinBoard(boardId: string):Promise<WhiteBoard> {
    let res = await request.post<any, {board:WhiteBoard}>(
        "/api/board/join",
        {boardId}
    );
    let board = DataLoader.load(WhiteBoard, res.board);
    board.pages = board.pages.map(r => Object.assign(new Page(), r));
    return board;
}

export async function getCreatedBoards():Promise<any> {
    let res = await request.get<any, {boards:WhiteBoard[]}>(
        "/api/board/boards"
    );
    return res.boards
}


export async function getJoinedBoards():Promise<any> {
    let res = await request.get<any, {boards:WhiteBoard[]}>(
        "/api/board/boards/joined"
    );
    return res.boards
}

export async function createPage(boardId:string, name:string, pageData?: string):Promise<Page[]> {
    let res = await request.post<any, {pages:Page[]}>(
        "/api/page",{boardId, name, pageData}
    );
    return res.pages.map(r => Object.assign(new Page(), r));
}

/**
 * 获取所有页面的概要信息
 */
export async function getPages(boardId:string):Promise<Page[]> {
    let res = await request.get<any, {pages:Page[]}>(
        `/api/board/pages?boardId=${boardId}`
    );
    return res.pages.map(r => Object.assign(new Page(), r));
}

type ExportFileResp = {
    name: string
    data: string
}

export async function exportFile(pageId: string) {
    return request.get<any, ExportFileResp>(
        "/api/page/export",
        {params: {pageId}}
    );
}

export async function rename(name:string) {
    await request.post<any, null>(
        "/api/user/rename",
        {name}
    )
}
