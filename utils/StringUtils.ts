export class StringUtils {

	public static makeURLString(url: string, data?: object) {
		return data ? url + "?" + this.makeQueryParam(data) : url;
	}

	public static makeQueryParam(data) {
		if (!data) return "";

		let res = Object.keys(data).reduce(
			(res, key) => (res + key + '=' +
				this.convertParam(data[key]) + '&'), '');
		if (res !== '')
			res = res.substr(0, res.lastIndexOf('&'));

		return res;
	}

	public static convertParam(data) {
		let res = data;
		if (typeof data === 'object') res = JSON.stringify(res);
		return encodeURIComponent(res);
	}
}
