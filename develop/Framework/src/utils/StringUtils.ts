export class StringUtils {

	public static fillData2Str(str, data) {
		const re = /\${(.+?)}/g;
		let res = str, match;

		while ((match = re.exec(str)) !== null) {
			res = res.replace(match[0], data[match[1]])
			delete data[match[1]];
		}
		return res;
	}
}
