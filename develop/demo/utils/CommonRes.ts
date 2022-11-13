

export class CommonRes{
    code: code
    data: object
    msg: string

    constructor(code:code, data: object,msg: string) {
        this.code = code;
        this.data = data;
        this.msg = msg;
    }
}


export const success = (data: object, msg: string): CommonRes => {
    return new CommonRes(0,data,msg);
}

export const error = (code: code, msg: string): CommonRes => {
    return new CommonRes(code,null,msg);
}



//此处配置定义所有的状态码
export type code = 0    //成功
    | 1          //保存帖子失败
    | 2          //修改帖子失败
    | 3          //删除帖子失败
    | 4          //查询帖子失败