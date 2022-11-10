import {ElementBase} from "../element/ElementBase";
import {field, SerializableData} from "../../../../utils/data/DataLoader";

export class Page extends SerializableData {

    @field
    id:string;
    @field
    createTime:number;
    @field
    deleteTime:number = -1;
    @field
    updateTime:number;
    @field
    whiteBoardId:string;
    @field
    displayName:string
    @field(Array<ElementBase>)
    elements:ElementBase[] = []

    constructor(id:string, whiteBoardId:string, displayName:string) {
        super();
        this.id = id;
        this.createTime = this.updateTime = new Date().valueOf();
        this.whiteBoardId = whiteBoardId; this.displayName = displayName;
    }

    public findElemIdxById(id:string, deleted:boolean = false):number{
        // TODO 如果交换元素顺序时可以通过交换id来实现，那么数组中的id就是升序的，这里就可以是用二分法降低复杂度
        for(let i = 0;i < this.elements.length; i++) {
            if(this.elements[i].id === id) {
                if(this.elements[i].isDeleted) {
                    if(deleted) return i;
                    return -1;
                } else {
                    return i;
                }
            }
        }
        return -1;
    }

    public deleteElemById(id:string) {
        let i = this.findElemIdxById(id);
        if(i !== -1) this.elements[i].isDeleted = true;
    }

    public addElem(elem:ElementBase) {
        this.elements.push(elem);
    }


}

