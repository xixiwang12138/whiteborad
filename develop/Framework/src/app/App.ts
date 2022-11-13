import express, {Express} from "express";
import bodyparser from "body-parser";
import 'reflect-metadata'
import cron from "node-cron";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";

export const CertInfo = { key: null, cert: null };
try {
	CertInfo.key = fs.readFileSync('./server.key');
	CertInfo.cert = fs.readFileSync('./server.crt')
} catch (e) {
	console.log("由于缺少证书，无法启动HTTPS服务器，已用HTTP代替")
}

import {getSingleton, singleton} from "../utils/SingletonUtils";

export function app(): App {
	const res = getSingleton(App)
	if (!res) singleton(App);
	return getSingleton(App);
}

export function moduleContext(): ModuleContext {
	return app().moduleContext;
}
export function managerContext(): ManagerContext {
	return app().managerContext;
}
export function repositoryContext(): RepositoryContext {
	return app().repositoryContext;
}

// region 控制修饰器

export function schedule(expr, log: boolean = true) {
	return (obj, key, desc) => {
		cron.schedule(expr, async () => {
			try {
				if (log) console.log("[Schedule Start]", obj, key);
				await desc.value();
				if (log) console.log("[Schedule Finish]", obj, key);
			} catch (e) {
				console.log("[Schedule Error]", obj, key, e);
			}
		})
	}
}

// endregion

// @singleton
export class App {

	public deltaTime: number = 0;
	public lastTime: number = 0;
	public nowTime: number = 0;

	private updateTask;

	private dbSyncTask;
	private redisSyncTask;

	private app: Express;
	private server: http.Server | https.Server;

	private appProcessors: ((app: Express) => void)[] = [];

	// region 初始化

	public _moduleContext;
	public _managerContext;
	public _repositoryContext;

	public get moduleContext() {
		return this._moduleContext ||= new ModuleContext();
	};
	public get managerContext() {
		return this._managerContext ||= new ManagerContext();
	};
	public get repositoryContext() {
		return this._repositoryContext ||= new RepositoryContext();
	};

	/**
	 * 开始
	 */
	public async start() {
		await this.setupModules();
		this.setupPlugins();
		await this.setupRepositories();
		await this.setupUpdateTask();

		this.app = await this.createApp();

		this.server = await this.listen();

		// this.onListenStart();
	}

	// region 初始化APP

	public registerAppProcessor(func: (app: Express) => void) {
		this.appProcessors.push(func);
	}

	protected createApp() {
		const app = express();
		this.appProcessors.forEach(p => p(app));
		return app;
	}

	private listen(port = Config.port) {
		if (!port) return; // 关闭HTTP端口
		return new Promise<http.Server | https.Server>(resolve => {
			const server = CertInfo.cert ?
				https.createServer(CertInfo, this.app)
					.listen(port, () => this.onStart(resolve, server)) :
				this.app.listen(port, () => this.onStart(resolve, server))
		});
	}
	// private listen(port = Config.port) {
	// 	return new Promise<http.Server>(resolve => {
	// 		const res = this.app.listen(port, () => resolve(res));
	// 	})
	// }

	protected onStart(resolve, server) {
		const addr = server.address();
		if (typeof addr === 'string') console.log("应用实例", addr)
		else if (addr) {
			let host = addr.address;
			let port = addr.port;

			console.log("应用实例", host, port)
		}
		resolve(server);
	}

	// endregion

	/**
	 * 初始化模块
	 */
	protected setupModules() {
		// InstalledModules.forEach(
		// 	this.moduleContext.create.bind(this.moduleContext));
		const modules = AppConfig.installModules;
		const root = `../modules`;
		if (modules == "all") {
			const files = getFiles(__dirname, root);
			this.importFiles(files, "Module");
		} else if (modules instanceof Array) {
			modules.forEach(m => {
				const files = getFiles(__dirname, `${root}/${m}`);
				this.importFiles(files, "Module");
			})
		}
	}

	private importFiles(files, name?) {
		files = files.filter(f => f.endsWith(".js"));
		console.log(`Import ${name}s`, files);
		files.forEach(f => {
			console.log(`Import`, f); require(f)
		});
	}

	/**
	 * 初始化Update任务
	 */
	protected setupUpdateTask() {
		this.updateTask = setInterval(() => {
			this.lastTime = this.nowTime;
			this.nowTime = Date.now();
			if (this.lastTime == 0) return; // 第一帧跳过

			this.deltaTime = this.nowTime - this.lastTime;
			this.managerContext.update(this.deltaTime);
		}, Config.updateInterval)
	}

	/**
	 * 初始化Repo
	 */
	protected async setupRepositories() {
		await dataMgr().connect();
		await this.repositoryContext.initialize();

		this.dbSyncTask = setInterval(
			() => this.repositoryContext.dbSync()
		, Config.cache.dbSyncInterval);
		this.redisSyncTask = setInterval(
			() => this.repositoryContext.redisSync()
		, Config.cache.redisSyncInterval);
	}
	/**
	 * 初始化插件
	 */
	protected setupPlugins() {
		const plugins = AppConfig.installPlugins;
		const root = `../plugins`;
		if (plugins == "all") {
			const files = getFiles(__dirname, root);
			this.importFiles(files, "Plugin");
		} else if (plugins instanceof Array) {
			plugins.forEach(m => {
				const files = getFiles(__dirname, `${root}/${m}`);
				this.importFiles(files, "Plugin");
			})
		}
	}


	// endregion

}

import {ModuleContext} from "./ModuleContext";
import {ManagerContext} from "./ManagerContext";
import {RepositoryContext} from "./RepositoryContext";

import {CoreModule} from "../modules/coreModule/CoreModule";
import {PlayerModule} from "../modules/playerModule/PlayerModule";
import {Config} from "../configs/Config";
import {dataMgr} from "../modules/coreModule/managers/DataManager";
import {wsMgr} from "../plugins/websocket/WebSocketManager";
import {RoomModule} from "../modules/roomModule/RoomModule";
import {FocusModule} from "../modules/focusModule/FocusModule";
import {RobotModule} from "../modules/robotModule/RobotModule";
import {AppConfig} from "./AppConfig";
import {getFiles} from "../utils/FileUitls";



const InstalledPlugins = [
	wsMgr()
]
