import {field, SerializableData} from "../../../../utils/data/DataLoader";
import {Page} from "./Page";

export enum BoardType {
    Editable, ReadOnly
}

export class WhiteBoard extends SerializableData {
    @field
    public id:number;
    @field(BoardType)
    public mode:BoardType;
    @field
    public creator:number;
    @field
    public creatTime:number;
    @field
    public deleteTime:number;
    @field
    public updateTime:number;
    @field
    public pages:Page[];

}