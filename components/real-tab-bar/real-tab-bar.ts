import {pageMgr} from "../../modules/core/managers/PageManager";
import {MinePage} from "../../pages/mine/MinePage";
import {MainPage} from "../../pages/main/MainPage";
import {SquarePage} from "../../pages/square/SquarePage";
import {BasePage} from "../../pages/common/core/BasePage";

const Pages = [MainPage, SquarePage, MinePage];

/*
	@field(String)
	@occasion(DataOccasion.Extra)
	public get mainIcon(): string {
		const svg = `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M40.456 20.2887C40.8849 20.6614 40.6275 21.4068 40.0271 21.4068H36.3388C35.9957 21.4068 35.7384 21.6864 35.7384 22.0591V39.8568C35.7384 40.2296 35.4811 40.5091 35.138 40.5091H7.43298C7.08988 40.5091 6.83256 40.2296 6.83256 39.8568V22.0591C6.83256 21.6864 6.57524 21.4068 6.23214 21.4068H2.88695C2.28654 21.4068 2.02921 20.6614 2.45808 20.2887L21.0711 2.58411C21.3284 2.39775 21.6715 2.39775 21.843 2.58411L40.456 20.2887ZM28.1903 29.7C29.6485 25.6932 28.3618 22.8977 26.1317 22.0591C24.0731 21.3137 21.9288 23.1773 21.4141 23.9227C20.8137 23.1773 18.4978 21.3137 16.3535 22.0591C13.9518 22.8977 12.5794 25.6932 14.1234 29.7C14.8095 31.4705 16.3535 32.775 17.8116 33.7068C19.2698 34.6387 20.728 35.1978 21.2426 35.3841C21.3284 35.3841 21.3284 35.3841 21.3284 35.3841H21.4141C22.5292 35.0114 26.9037 33.2409 28.1903 29.7Z" fill="white"/>
<path d="M40.456 20.2887L21.843 2.58411C21.5857 2.39775 21.2426 2.39775 21.0711 2.58411L2.45808 20.2887C2.02921 20.6614 2.28654 21.4068 2.88695 21.4068H6.14637C6.48946 21.4068 6.74679 21.6864 6.74679 22.0591V39.8568C6.74679 40.2296 7.00411 40.5091 7.3472 40.5091H35.138C35.4811 40.5091 35.7384 40.2296 35.7384 39.8568V22.0591C35.7384 21.6864 35.9957 21.4068 36.3388 21.4068H40.0271C40.6275 21.4068 40.8849 20.6614 40.456 20.2887Z" stroke="#E0E0FF" stroke-width="3" stroke-miterlimit="10"/>
<path d="M28.1903 29.7C26.9037 33.241 22.5292 35.0114 21.5 35.3841H21.4142H21.3284C20.8138 35.1978 19.3556 34.6387 17.8974 33.7069C16.4393 32.775 14.8954 31.4705 14.2092 29.7C12.6652 25.6932 14.0376 22.8978 16.4393 22.0591C18.5836 21.3137 20.8995 23.1773 21.5 23.9228C22.0146 23.1773 24.159 21.3137 26.2175 22.0591C28.3619 22.8978 29.6485 25.7864 28.1903 29.7Z" stroke="#E0E0FF" stroke-width="3" stroke-miterlimit="10"/>
</svg>`
		const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
		return `background-image: url(${dataUrl})`;
	}

 */

Component({
  properties: {
    curPageIndex: {
      type: Number, value: 0
    },
    lightColor: {
      type: String, value: "#FFFFFF"
    },
    darkColor: {
      type: String, value: "#000000"
    }
  },
  data: {
    pages: [{
      pageIdx: 0,
      text: "首页",
      iconPath: "../../assets/tabbar/main.png",
      selectedIconPath: "../../assets/tabbar/main-selected.png"
    }, {
      pageIdx: 1,
      text: "广场",
      iconPath: "../../assets/tabbar/square.png",
      selectedIconPath: "../../assets/tabbar/square-selected.png"
    }, {
      pageIdx: 2,
      text: "我的",
      iconPath: "../../assets/tabbar/mine.png",
      selectedIconPath: "../../assets/tabbar/mine-selected.png"
    }],
  },

  methods: {
    onTap(e) {
      const data = e.currentTarget.dataset
      const item = data.item;

      this.setData({ selected: data.index });
      if (item.pageIdx != undefined) {
        pageMgr().switch<any, BasePage>(Pages[item.pageIdx]).then();
      }
    },
  }
});
