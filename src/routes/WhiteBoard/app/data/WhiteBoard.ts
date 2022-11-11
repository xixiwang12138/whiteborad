import {field, SerializableData} from "../../../../utils/data/DataLoader";
import {Page} from "./Page";

export enum BoardType {
    Editable, ReadOnly
}

export class WhiteBoard extends SerializableData {
    @field
    public id:string;
    @field
    public mode:BoardType;
    @field
    public creator:string;
    @field
    public creatTime:number;
    @field
    public deleteTime:number;
    @field
    public updateTime:number;
    @field
    public name:string;

    @field(Array<Page>)
    public pages:Page[];

}
