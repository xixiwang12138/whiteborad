import {playerMgr} from "../modules/player/managers/PlayerManager";
import {showLoading} from "../modules/core/managers/LoadingManager";
import {handleError} from "../modules/core/managers/ErrorManager";

export type MediaFile = {
	size: number
	thumb: string
	type: "image" | "video"
	url: string
}

export type File = {
	name: string,
	url: string,
	type: string
}

const BasePath = "cloud://env-8gbpg0wjca0c43ce.656e-env-8gbpg0wjca0c43ce-1255510304/homi/assets";

export class CloudFileUtils {

	/**
	 * 下载图片
	 */
	public static pathToFileId(path: string) {
		if (path.startsWith("@")) path = path.slice(1);
		return BasePath + path;
	}

	/**
	 * 下载图片
	 */
	public static async downloadFile(path) {
		const fileID = this.pathToFileId(path);
		console.log("downloadFile: ", fileID)
		const res = await wx.cloud.downloadFile({fileID})
			.then(res => {console.log(res); return res})
			.catch(e => {console.error("catch", e); return null;})
			.finally(() => console.log("finally"))
		return res.tempFilePath;
	}

	/**
	 * 媒体文件转化为文件
	 */
	public static mediaFile2File(name: string, file: MediaFile): File {
		const ext = this.getExt(file.url);
		return {
			name: this.generateFileName(name, ext),
			url: file.url, type: file.type
		}
	}

	/**
	 * 生成文件名
	 */
	public static generateFileName(name, ext) {
		const openid = playerMgr().openid;
		return `${openid}-${Date.now()}-${name}.${ext}`;
	}

	/**
	 * 上传多个图片至云存储，并返回永久fileID
	 * @param {Array} files 文件列表
	 * @param {String} path 指定储存的文件夹路径
	 */
	@handleError(true)
	@showLoading
	public static async uploadFiles(files: File[], path: string) {
		console.log("uploadFiles: ", files, path);
		const tasks: Promise<ICloud.UploadFileResult>[]
			= files.map(f => this.uploadFile(f, path));
		// tasks是若干Promise对象的集合，此时已经上传成功
		// 用下面的方法，data就是提取出来的返回结果
		const data = await Promise.all(tasks);
		// 把固定地址返回，保存进数据库
		return data.map(f => f.fileID);
	}

	/**
	 * 上传单个图片
	 * @param file
	 * @param path
	 */
	public static uploadFile(file, path) {
		return wx.cloud.uploadFile({
			cloudPath: `${path}/${file.name}`,
			filePath: file.url
		})
	}

	/**
	 * 获取拓展名
	 * @param path
	 */
	public static getExt(path) {
		return path.substr(path.lastIndexOf(".") + 1);
	}
}
