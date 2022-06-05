
const ExpCalc = {
	A: 5, B: 15, C: 150
};

export class LevelCalculator {

	public static needExp(level) {
		level--;
		return ExpCalc.A * level * level + ExpCalc.B * level + ExpCalc.C;
	}
	public static level(exp) {
		return this.levelInfo(exp).level;
	}
	public static curExp(exp) {
		const info = this.levelInfo(exp)
		return info.exp + this.needExp(info.level);
	}
	public static restExp(exp) {
		return -this.levelInfo(exp).exp;
	}
	public static expRate(exp) {
		const info = this.levelInfo(exp);
		const need = this.needExp(info.level);
		return info.exp / need + 1;
	}
	private static levelInfo(exp) {
		let level = 0;
		while ((exp -= this.needExp(++level)) >= 0) {}
		return {level, exp};
	}

}
