import {BasePageData, PartialPage} from "../core/BasePage";
import {CloudFileUtils, MediaFile} from "../../../utils/CloudFileUtils";
import {pageFunc} from "../PageBuilder";
import CustomEvent = WechatMiniprogram.CustomEvent;
import {BaseData} from "../../../modules/core/data/BaseData";
import {field} from "../../../modules/core/data/DataLoader";


class Data extends BaseData {
    @field([Object])
    images: MediaFile[] = []
}

export class UploaderPage extends PartialPage<Data>{

    public data = new Data();

    private readonly uploadName:string;

    private readonly uploadPath:string;

    constructor(uploadName:string, uploadPath:string) {
        super();
        this.uploadName = uploadName;
        this.uploadPath = uploadPath;
    }

    // /**
    //  * uploader注入的节点的Id选择器
    //  */
    //
    // private slotId:string;
    //
    // constructor(slotId:string) {
    //     super();
    //     this.slotId = slotId;
    // }
    //
    // /**
    //  *注入uploader到wxml
    //  */
    //
    // private injectUploader(){
    //
    // }

    @pageFunc
    public async onFileChoose(e: CustomEvent) {
        this.data.images.push(e.detail.file)
        await this.setData({images: this.data.images});
    }

    @pageFunc
    public async onFileDelete(e: CustomEvent) {
        this.data.images.splice(e.detail.index, 1);
        await this.setData({images: this.data.images});
    }

    public async uploadPictures() {
        const files = this.data.images.map(
            f => CloudFileUtils.mediaFile2File(this.uploadName, f));
        return await CloudFileUtils.uploadFiles(files, this.uploadPath);
    }
}
