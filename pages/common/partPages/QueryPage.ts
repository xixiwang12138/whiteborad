import {PartialPage} from "../core/BasePage";
import {pageFunc} from "../PageBuilder";

const DefaultCount = 8;

export type QueryParams = {
	offset: number, count: number, filter: any
}

export class QueryPage extends PartialPage {

	/**
	 * 刷新函数
	 */
	public refreshFunc: Function;

	/**
	 * 基础过滤器
	 */
	public baseFilter = {}

	/**
	 * 页面展示数量
	 */
	public pageCount = DefaultCount;

	constructor(refreshFunc, baseFilter = {},
							pageCount = DefaultCount) {
		super();
		this.refreshFunc = refreshFunc;
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
	public refresh() {
		this.refreshFunc(this.queryParams);
	}

	/**
	 * 下拉刷新
	 */
	@pageFunc
	private onPullDownRefresh() {
		this.resetPage(); this.refresh();
		wx.stopPullDownRefresh();
	}

	/**
	 * 触底加载
	 */
	@pageFunc
	private onReachBottom() {
		this.nextPage(); this.refresh();
	}

}
