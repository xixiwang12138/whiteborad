
export class MathUtils {

	/**
	 * CLAMP
	 */
	public static clamp(val: number, min: number, max: number) {
		return Math.max(Math.min(val, max), min);
	}

	/**
	 * 生成随机字符串
	 * @param len
	 */
	public static randomString(len = 32) {
		const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
		const maxPos = chars.length;

		let res = '';
		for (let i = 0; i < len; i++)
		 	res += chars.charAt(Math.floor(Math.random() * maxPos));
		return res;
	}
}
