import {PartialPage} from "../core/BasePage";
import {pageFunc} from "../PageBuilder";
import {BaseData} from "../../../modules/core/data/BaseData";

const DefaultCount = 8;

export type QueryParams = {
	offset: number, count: number, filter: any
}

export class QueryPage<T = any> extends PartialPage {

	/**
	 * 刷新函数
	 */
	public refreshFunc: (queryParams: QueryParams) => Promise<T[]>;

	/**
	 * 基础过滤器
	 */
	public baseFilter = {}

	/**
	 * 页面展示数量
	 */
	public pageCount = DefaultCount;

	/**
	 * 主页面的数据键
	 */
	public dataKey: string;

	/**
	 * 查询获得的数据
	 */
	public results: T[] = [];

	constructor(refreshFunc: (queryParams: QueryParams) => Promise<T[]>,
							dataKey = "items", baseFilter = {},
							pageCount = DefaultCount) {
		super();
		this.refreshFunc = refreshFunc;
		this.dataKey = dataKey;
		this.baseFilter = baseFilter;
		this.pageCount = pageCount;
		this.resetPage();
		this.setFilter();
	}

	/**
	 * 查询参数
	 */
	public queryParams: QueryParams = {
		offset: 0, count: 0, filter: {}
	}

	/**
	 * 重置查询参数
	 */
	public resetPage() {
		this.results = [];
		this.queryParams.offset = 0;
		this.queryParams.count = this.pageCount;
	}

	/**
	 * 切换到下一页
	 */
	public nextPage() {
		this.queryParams.offset += DefaultCount;
	}

	/**
	 * 设置过滤器
	 */
	public setFilter(filter = {}) {
		this.queryParams.filter = {
			...this.baseFilter, ...filter
		};
	}

	/**
	 * 刷新
	 */
	public async refresh() {
		const res = await this.refreshFunc(this.queryParams);
		this.results = this.results.concat(res);
		await this.syncData();
	}

	/**
	 * 同步数据到主页面
	 */
	public syncData() {
		this.page.setData({[this.dataKey]: this.results});
	}

	/**
	 * 下拉刷新
	 */
	@pageFunc
	private async onPullDownRefresh() {
		this.resetPage(); await this.refresh();
		await wx.stopPullDownRefresh();
	}

	/**
	 * 触底加载
	 */
	@pageFunc
	private async onReachBottom(e) {
		this.nextPage(); await this.refresh();
	}

}
