import {doLogin, doRegister, LoginForm, RegisterForm} from "./api/api";

export type UserInfo =  {
    id:number,
    name:string,
    avatar:string,
    creatTime:number,
    updateTime:number,
    deleteTime:number
}

export class UserManager {

    private static userInfo: UserInfo

    public static async login(form:LoginForm) {
        let res = await doLogin(form);
        localStorage.setItem("token",res.token);
        this.userInfo = res.user;
    }

    public static async register(form:RegisterForm) {
        let res = await doRegister(form);
        localStorage.setItem("token",res.token);
        this.userInfo = res.user;
    }

    public static getId() {
        return this.userInfo.id;
    }

    public static getAvatar() {
        return this.userInfo.avatar;
    }
}