import {BaseManager, getManager, manager} from "./BaseManager";
import {Itf, post} from "../BaseAssist";

const UpdateToken: Itf<{}, {token: string}>
  = post("/core/token/update");

class Token {
  // TOKEN有效总时间
  public static Duration = 30 * 60 * 1000;
  // TOKEN更新时间（测试30秒）
  public static UpdateDuration = 15 * 60 * 1000;

  public value: string;
  public time: number;

  // 是否过时
  public isOutOfDate() {
    const now = Date.now();
    return now > this.time + Token.Duration;
  }

  // 是否需要刷新
  public isNeedUpdate() {
    const now = Date.now();
    return now > this.time + Token.UpdateDuration;
  }

  public static create(token) {
    const res = new Token();
    res.value = token;
    res.time = Date.now();
    return res;
  }

  public static invalid() {
    let token = new Token();
    token.time = -1000;
    token.value = "";
    return token;
  }
}

export function appMgr(): AppManager {
	return getManager(AppManager);
}

@manager
class AppManager extends BaseManager {

	private token: Token = null; // Token.invalid();

	private lastCheckUpdToken: number = 0;

	// region 更新

	update() {
		super.update();
		this.checkUpdateToken();
	}

	private checkUpdateToken() { // 每5秒检查一次更新
		if (this.token?.isNeedUpdate() &&
			Date.now() - this.lastCheckUpdToken > 5000) {

			this.lastCheckUpdToken = 1e300; // 防止频繁更新

			this.updateToken().finally(() => {
				this.lastCheckUpdToken = Date.now();
			});
		}
	}

	// endregion

	// region Token管理

	/**
	 * 获取Token值
	 */
	public getToken() {
		return this.token?.value;
	}

	/**
	 * 设置Token
	 */
	public setupToken(token: string) {
		this.token = Token.create(token);
	}

	/**
	 * 清空Token
	 */
	public clearToken() {
		this.token = null;
	}

	/**
	 * 更新Token
	 */
	public async updateToken() {
		try {
			console.log("UpdateToken!");
			const res = await UpdateToken();
			this.token = Token.create(res.token);
		} catch (e) {
			this.clearToken();
		}
	}

	// endregion

}
