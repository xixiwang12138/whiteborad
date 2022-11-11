import {doLogin, doRegister, getUserInfo, LoginForm, RegisterForm} from "./api/api";

export type UserInfo =  {
    id:string,
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
        localStorage.setItem("uid", res.user.id);
        this.userInfo = res.user;
    }

    public static async register(form:RegisterForm) {
        let res = await doRegister(form);
        localStorage.setItem("token",res.token);
        localStorage.setItem("uid", res.user.id);
        this.userInfo = res.user;
    }

    public static async syncUser() {
        if(!this.userInfo) {
            this.userInfo = await getUserInfo();
            localStorage.setItem("uid", this.userInfo.id);
        }
    }

    public static getId() {
        return this.userInfo.id;
    }

    public static async getAvatar() {
        if(!this.userInfo) await this.syncUser();
        return this.userInfo.avatar;
    }
}