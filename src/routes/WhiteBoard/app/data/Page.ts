import {ElementBase} from "../element/ElementBase";
import {field, SerializableData} from "../../../../utils/data/DataLoader";
import {CmdPayloads, CmdType} from "../../ws/message";

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

    public findElemById(id:string, deleted:boolean = false):ElementBase | null{
        // TODO 如果交换元素顺序时可以通过交换id来实现，那么数组中的id就是升序的，这里就可以是用二分法降低复杂度
        for(let i = 0;i < this.elements.length; i++) {
            if(this.elements[i].id === id) {
                if(this.elements[i].isDeleted) {
                    if(deleted) return this.elements[i];
                    return null;
                } else {
                    return this.elements[i];
                }
            }
        }
        return null;
    }

    // /**
    //  *  删除页面中的元素
    //  */
    // public deleteElemById(id:string) {
    //     let i = this.findElemIdxById(id);
    //     if(i !== -1) this.elements[i].isDeleted = true;
    //     else throw "element not found"
    // }
    //
    // /**
    //  *  恢复页面中的元素
    //  */
    // public restoreElemById(id:string) {
    //     let i = this.findElemIdxById(id);
    //     if(i !== -1) this.elements[i].isDeleted = false;
    //     else throw "element not found"
    // }


    /**
     *  更新页面中的元素状态
     */
    public updateElemStateById(id:string, adjust:CmdPayloads[CmdType.Adjust], backTrace:boolean) {
        let elem = this.findElemById(id) as any;
        if(elem) {
            Object.keys(adjust).forEach(k => {
                if(backTrace) elem[k] = adjust[k][0];
                else elem[k] = adjust[k][1];
            });
        } else {
            throw "element not found"
        }
    }

    public addElem(elem:ElementBase) {
        this.elements.push(elem);
    }


}

