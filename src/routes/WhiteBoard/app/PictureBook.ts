import {Page} from "./data/Page";
import {CmdPayloads, CmdType, loadElemByObject} from "../ws/message";
import {ElementBase} from "./element/ElementBase";


export class PictureBook {

    private _curPage:Page;
    get curPage() {return this._curPage;}

    private pages:Map<string, Page> = new Map<string, Page>();

    public addPage(page:Page) {
        this.pages.set(page.id, page);
    }

    public deletePage(pageId:string) {
        this.pages.delete(pageId)
    }

    public switchPage() {

    }

    public loadPage(serializedPage: string) {
        let page = new Page();
        Object.assign(page, JSON.parse(serializedPage));
        page.elements = page.elements.map(obj => loadElemByObject(obj));
        this.pages.set(page.id, page);
        this._curPage = page;
    }

    public addElemInPage(elem:ElementBase, pageId:string) {
        if(pageId !== this._curPage.id) {
            this.pages.get(pageId)?.addElem(elem); // 这里使用安全链式调用就可以保证在没有page缓存时，不操作
        } else {
            this._curPage.addElem(elem);
        }
    }

    public deleteElemInPage(elemId:string, pageId:string) {
        if(pageId !== this._curPage.id) {
            this.pages.get(pageId)?.deleteElemById(elemId); // 这里使用安全链式调用就可以保证在没有page缓存时，不操作
        } else {
            this._curPage.deleteElemById(elemId);
        }
    }

    public adjustElemInPage(elemId:string, adjust:CmdPayloads[CmdType.Adjust],
                            pageId:string, backTrace = false) {
        if(pageId !== this._curPage.id) {
            this.pages.get(pageId)?.adjustElemById(elemId, adjust, backTrace);
        } else {
            this._curPage.adjustElemById(elemId, adjust, backTrace);
        }
    }

    public findElemInPage(elemId:string, deleted:boolean = false, pageId?:string) {
        if(pageId) {
            return this.pages.get(pageId)?.findElemById(elemId, deleted);
        } else {
            return this.curPage.findElemById(elemId, deleted);
        }
    }


}