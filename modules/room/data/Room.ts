import {MainData} from "../../core/data/BaseData";
import {field} from "../../core/data/DataLoader";

export enum PlayerState {
    Normal, Banned
}

export class Room extends MainData {

    @field
    public roomId: string = "";
    @field
    public displayId: string = "";
    @field
    public name: string = "";
    @field
    public createAccount: string = "";

}
