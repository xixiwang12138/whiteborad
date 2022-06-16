import {BasePage, PartialPage} from "../core/BasePage";
import {MathUtils} from "../../../utils/MathUtils";
import {PageBuilder, pageFunc} from "../PageBuilder";
import {Constructor} from "../../../modules/core/BaseContext";
import {StringUtils} from "../../../utils/StringUtils";
import {LoginPage} from "../../login/LoginPage";

const ShareTitles = [
	"跟我来元宇宙小屋里一起学习吧！",
	""
]

type ShareAppParams = {
	from: "menu" | "button", target: any, webViewUrl: string
}
type ShareAppContent = {
	title?: string, path?: string, imageUrl?: string, promise?: Promise<string>
}
type ShareTimelineContent = {
	title?: string, query?: string, imageUrl?: string
}

export class ShareAppPage extends PartialPage {

	private readonly sharePage: Constructor<BasePage>;
	private readonly extra: any = {};

	public readonly onShare?: (ShareParams) => ShareAppContent;

	constructor(sharePage: Constructor<BasePage> = DefaultSharePage,
							extra?) {
		super();
		this.sharePage = sharePage;
		this.extra = extra;
	}

	protected get title() { return MathUtils.randomPick(ShareTitles) }

	private get path() { return PageBuilder.getPageSetting(this.sharePage); }

	@pageFunc
	protected onShareAppMessage(obj: ShareAppParams) {
		const path = this.path + "?" + StringUtils.makeQueryParam(this.extra);
		return {
			title: this.title, path, ...this.onShare?.(obj)
		}
	}
}

export class ShareTimelinePage extends PartialPage {

	private readonly query: any = {};

	public readonly onShare?: () => ShareTimelineContent;

	constructor(query?) {
		super();
		this.query = query;
	}

	protected get title() { return MathUtils.randomPick(ShareTitles) }

	@pageFunc
	protected onShareTimeline() {
		const query = StringUtils.makeQueryParam(this.query);
		return {
			title: this.title, query, ...this.onShare?.()
		}
	}
}

const DefaultSharePage = LoginPage;
