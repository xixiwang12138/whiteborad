import {UserManager} from "../UserManager";

export class IdGenerator {

    public static genElementId(userId?:string):string {
        if(!userId) userId = UserManager.getId();
        return Number(userId).toString(16) + Number(new Date().valueOf()).toString(16) + "e";
    }

    public static genCmdId(userId?:string):string {
        if(!userId) userId = UserManager.getId()
        return Number(userId).toString(16) + Number(new Date().valueOf()).toString(16) + "c";
    }

}