import {field, SerializableData} from "../../../../utils/data/DataLoader";
import {Page} from "./Page";
import {BoardMode} from "../../index";

export class WhiteBoard extends SerializableData {
    @field
    public id:string;
    @field
    public mode:BoardMode;
    @field
    public name: string;
    @field
    public creator:string;
    @field
    public creatTime:number;
    @field
    public deleteTime:number;
    @field
    public updateTime:number;


    @field
    public defaultPage:string;

    @field(Array<Page>)
    public pages:Page[];

}
