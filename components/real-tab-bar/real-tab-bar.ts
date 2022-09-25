import {pageMgr} from "../../modules/core/managers/PageManager";
import {MinePage} from "../../pages/mine/MinePage";
import {MainPage} from "../../pages/main/MainPage";
import {SquarePage} from "../../pages/square/SquarePage";
import {BasePage} from "../../pages/common/core/BasePage";
import {Constructor} from "../../modules/core/BaseContext";
import {Theme} from "../../modules/room/data/Theme";

const Pages: Constructor<BasePage<any, any>>[]
  = [MainPage, SquarePage, MinePage];

const SelectedColor = "white";
const DeselectedColor = "transparent";

Component({
  properties: {
    curPageIndex: {
      type: Number, value: 0
    },
    theme: {
      type: Object, value: new Theme(),
      observer: "onThemeChanged"
    }
  },
  data: {
    pages: [{
      pageIdx: 0,
      text: "首页",
      rawSvg: `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M40.456 20.2887C40.8849 20.6614 40.6275 21.4068 40.0271 21.4068H36.3388C35.9957 21.4068 35.7384 21.6864 35.7384 22.0591V39.8568C35.7384 40.2296 35.4811 40.5091 35.138 40.5091H7.43298C7.08988 40.5091 6.83256 40.2296 6.83256 39.8568V22.0591C6.83256 21.6864 6.57524 21.4068 6.23214 21.4068H2.88695C2.28654 21.4068 2.02921 20.6614 2.45808 20.2887L21.0711 2.58411C21.3284 2.39775 21.6715 2.39775 21.843 2.58411L40.456 20.2887ZM28.1903 29.7C29.6485 25.6932 28.3618 22.8977 26.1317 22.0591C24.0731 21.3137 21.9288 23.1773 21.4141 23.9227C20.8137 23.1773 18.4978 21.3137 16.3535 22.0591C13.9518 22.8977 12.5794 25.6932 14.1234 29.7C14.8095 31.4705 16.3535 32.775 17.8116 33.7068C19.2698 34.6387 20.728 35.1978 21.2426 35.3841C21.3284 35.3841 21.3284 35.3841 21.3284 35.3841H21.4141C22.5292 35.0114 26.9037 33.2409 28.1903 29.7Z" fill="{S}"/>
  <path d="M40.456 20.2887L21.843 2.58411C21.5857 2.39775 21.2426 2.39775 21.0711 2.58411L2.45808 20.2887C2.02921 20.6614 2.28654 21.4068 2.88695 21.4068H6.14637C6.48946 21.4068 6.74679 21.6864 6.74679 22.0591V39.8568C6.74679 40.2296 7.00411 40.5091 7.3472 40.5091H35.138C35.4811 40.5091 35.7384 40.2296 35.7384 39.8568V22.0591C35.7384 21.6864 35.9957 21.4068 36.3388 21.4068H40.0271C40.6275 21.4068 40.8849 20.6614 40.456 20.2887Z" stroke="{lightColor}" stroke-width="3" stroke-miterlimit="10"/>
  <path d="M28.1903 29.7C26.9037 33.241 22.5292 35.0114 21.5 35.3841H21.4142H21.3284C20.8138 35.1978 19.3556 34.6387 17.8974 33.7069C16.4393 32.775 14.8954 31.4705 14.2092 29.7C12.6652 25.6932 14.0376 22.8978 16.4393 22.0591C18.5836 21.3137 20.8995 23.1773 21.5 23.9228C22.0146 23.1773 24.159 21.3137 26.2175 22.0591C28.3619 22.8978 29.6485 25.7864 28.1903 29.7Z" stroke="{lightColor}" stroke-width="3" stroke-miterlimit="10"/>
</svg>`,
      style: "",
      iconPath: "../../assets/tabbar/main.png",
      selectedIconPath: "../../assets/tabbar/main-selected.png"
    }, {
      pageIdx: 1,
      text: "广场",
      rawSvg: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g style="mix-blend-mode:luminosity">
    <path d="M14.6379 31.8615H11.5129V37.1428H14.6379V31.8615Z" fill="{S}"/>
    <path d="M34.6212 19.8268V37.1428H23.6838V31.8614H27.7956C28.5357 31.8614 29.1114 31.2554 29.1114 30.4762C29.1114 29.6969 28.5357 29.0043 27.7956 29.0043H23.6838V26.1472H27.7956C28.5357 26.1472 29.1114 25.5411 29.1114 24.7619C29.1114 23.9826 28.5357 23.3766 27.7956 23.3766H23.6838V15.4978L34.6212 19.8268Z" fill="{S}"/>
    <path d="M20.97 30.5627V37.1428H17.2694V29.0043H8.79915V37.1428H4.68738V2.85712H20.97V13.3333V24.6753V24.7619V24.8485V30.3896V30.4762C20.97 30.4762 20.97 30.4762 20.97 30.5627ZM16.9405 22.8571V20C16.9405 19.2208 16.3648 18.5281 15.5425 18.5281C14.8023 18.5281 14.2267 19.1342 14.2267 20V22.8571C14.2267 23.6363 14.8023 24.2424 15.5425 24.2424C16.3648 24.2424 16.9405 23.6363 16.9405 22.8571ZM16.9405 12.8138V9.95668C16.9405 9.17746 16.3648 8.48482 15.5425 8.48482C14.8023 8.48482 14.2267 9.09088 14.2267 9.95668V12.8138C14.2267 13.593 14.8023 14.2857 15.5425 14.2857C16.3648 14.2857 16.9405 13.593 16.9405 12.8138ZM11.5129 22.8571V20C11.5129 19.2208 10.9373 18.5281 10.1149 18.5281C9.29257 18.5281 8.79915 19.2208 8.79915 20V22.8571C8.79915 23.6363 9.3748 24.2424 10.1149 24.2424C10.855 24.2424 11.5129 23.6363 11.5129 22.8571ZM11.5129 12.8138V9.95668C11.5129 9.17746 10.9373 8.48482 10.1149 8.48482C9.29257 8.48482 8.79915 9.17746 8.79915 9.95668V12.8138C8.79915 13.593 9.3748 14.2857 10.1149 14.2857C10.855 14.2857 11.5129 13.593 11.5129 12.8138Z" fill="{S}"/>
    <path d="M37.3349 20.9524V37.1429H34.6211V19.8269L37.3349 20.9524Z" fill="{lightColor}"/>
    <path d="M37.3349 18.5281V20.9524L34.6211 19.8268V18.5281H37.3349Z" fill="{lightColor}"/>
    <path d="M39.1442 18.6147C39.802 18.8744 40.2132 19.7402 39.8843 20.4329C39.6376 21.2121 38.8152 21.5584 38.1573 21.2121L37.335 20.8658V18.4415H34.6212V19.7402L23.7661 15.2381V12.2078L39.1442 18.6147Z" fill="{lightColor}"/>
    <path d="M27.7956 23.29C28.5357 23.29 29.1114 23.8961 29.1114 24.6753C29.1114 25.4545 28.5357 26.0606 27.7956 26.0606H23.6838V23.2034H27.7956V23.29Z" fill="{lightColor}"/>
    <path d="M27.7956 29.0043C28.5357 29.0043 29.1114 29.6103 29.1114 30.4761C29.1114 31.2554 28.5357 31.8614 27.7956 31.8614H23.6838V29.0043H27.7956Z" fill="{lightColor}"/>
    <path d="M23.6839 31.8614V37.1428H20.9701V30.5627C20.9701 31.342 21.628 31.8614 22.2859 31.8614H23.6839Z" fill="{lightColor}"/>
    <path d="M23.6839 29.0043V31.8614H22.2859C21.5457 31.8614 20.9701 31.2554 20.9701 30.5627V30.3896C20.9701 29.6103 21.628 29.0909 22.2859 29.0909H23.6839V29.0043Z" fill="{lightColor}"/>
    <path d="M23.6839 26.1472V29.0043H22.2859C21.5457 29.0043 20.9701 29.6104 20.9701 30.303V24.8484C20.9701 25.6277 21.628 26.1472 22.2859 26.1472H23.6839Z" fill="{lightColor}"/>
    <path d="M23.6839 23.2901V26.1472H22.2859C21.5457 26.1472 20.9701 25.5412 20.9701 24.8485V24.6754C20.9701 23.8962 21.628 23.3767 22.2859 23.3767H23.6839V23.2901Z" fill="{lightColor}"/>
    <path d="M23.6839 12.2944V15.3247L21.7924 14.5455C21.299 14.2857 20.9701 13.7662 20.9701 13.2468C20.9701 13.0736 20.9701 12.9004 21.0523 12.7273C21.299 12.0346 22.1214 11.6017 22.7793 11.9481L23.6839 12.2944Z" fill="{lightColor}"/>
    <path d="M20.9701 24.5888V13.2468C20.9701 13.8528 21.299 14.3723 21.7924 14.5455L23.6839 15.3247V23.2035H22.2859C21.628 23.2901 21.0523 23.8961 20.9701 24.5888Z" fill="{lightColor}"/>
    <path d="M20.97 13.2468V2.85714H4.6874V37.1429H1.97363V2.85714C1.97363 1.2987 3.20717 0 4.6874 0H20.97C22.4503 0 23.6838 1.2987 23.6838 2.85714V12.2944L22.7792 11.9481C22.1213 11.6883 21.299 12.0346 21.0523 12.7273C21.0523 12.9004 21.0523 13.0736 20.97 13.2468Z" fill="{lightColor}"/>
    <path d="M17.3517 37.1429H14.6379V38.5282H17.3517V37.1429Z" fill="{lightColor}"/>
    <path d="M17.3517 29.0043V37.1428H14.6379V31.8614H11.513V37.1428H8.79919V29.0043H17.3517Z" fill="{lightColor}"/>
    <path d="M16.9406 20V22.8571C16.9406 23.6364 16.3649 24.2424 15.5426 24.2424C14.8025 24.2424 14.2268 23.6364 14.2268 22.8571V20C14.2268 19.2208 14.8025 18.5281 15.5426 18.5281C16.3649 18.5281 16.9406 19.2208 16.9406 20Z" fill="{lightColor}"/>
    <path d="M16.9406 9.95666V12.8138C16.9406 13.593 16.3649 14.2857 15.5426 14.2857C14.8025 14.2857 14.2268 13.6796 14.2268 12.8138V9.95666C14.2268 9.17744 14.8025 8.4848 15.5426 8.4848C16.3649 8.57138 16.9406 9.17744 16.9406 9.95666Z" fill="{lightColor}"/>
    <path d="M11.513 37.1429H8.79919V38.5282H11.513V37.1429Z" fill="{lightColor}"/>
    <path d="M11.513 20V22.8571C11.513 23.6364 10.9373 24.2424 10.115 24.2424C9.29261 24.2424 8.79919 23.6364 8.79919 22.8571V20C8.79919 19.2208 9.37484 18.5281 10.115 18.5281C10.8551 18.5281 11.513 19.2208 11.513 20Z" fill="{lightColor}"/>
    <path d="M11.513 9.95666V12.8138C11.513 13.593 10.9373 14.2857 10.115 14.2857C9.29261 14.2857 8.79919 13.593 8.79919 12.8138V9.95666C8.79919 9.17744 9.37484 8.4848 10.115 8.4848C10.8551 8.4848 11.513 9.17744 11.513 9.95666Z" fill="{lightColor}"/>
    <path d="M14.6379 38.5281H17.3517V37.0563H21.0523H23.7661H34.6212H37.3349C38.075 37.0563 38.6507 37.6623 38.6507 38.5281C38.6507 39.3939 38.075 40 37.3349 40H1.31577C0.575649 40 0 39.3939 0 38.5281C0 37.6623 0.575649 37.0563 1.31577 37.0563H1.97365H4.68742H8.7992V38.5281H11.513V37.0563H14.6379V38.5281Z" fill="{lightColor}"/>
  </g>
</svg>`,
      style: "",
      iconPath: "../../assets/tabbar/square.png",
      selectedIconPath: "../../assets/tabbar/square-selected.png"
    }, {
      pageIdx: 2,
      text: "我的",
      rawSvg: `<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M3.5 21.1142C3.5 11.351 11.2121 3.5 20.648 3.5C30.0839 3.5 37.796 11.351 37.796 21.1142C37.796 30.8774 30.0839 38.7284 20.648 38.7284C11.2121 38.7284 3.5 30.8774 3.5 21.1142ZM20.648 0.5C9.48587 0.5 0.5 9.76443 0.5 21.1142C0.5 32.464 9.48587 41.7284 20.648 41.7284C31.8102 41.7284 40.796 32.464 40.796 21.1142C40.796 9.76443 31.8102 0.5 20.648 0.5ZM14.8672 23.5478C15.8971 23.5478 16.732 22.3069 16.732 20.7762C16.732 19.2455 15.8971 18.0046 14.8672 18.0046C13.8372 18.0046 13.0023 19.2455 13.0023 20.7762C13.0023 22.3069 13.8372 23.5478 14.8672 23.5478ZM26.3357 23.5478C27.3656 23.5478 28.2005 22.3069 28.2005 20.7762C28.2005 19.2455 27.3656 18.0046 26.3357 18.0046C25.3058 18.0046 24.4709 19.2455 24.4709 20.7762C24.4709 22.3069 25.3058 23.5478 26.3357 23.5478Z" fill="{S}"/>
  <path d="M21.1142 40.2284C31.6707 40.2284 40.2284 31.6707 40.2284 21.1142C40.2284 10.5577 31.6707 2 21.1142 2C10.5577 2 2 10.5577 2 21.1142C2 31.6707 10.5577 40.2284 21.1142 40.2284Z" fill="white" stroke="{lightColor}" stroke-width="3" stroke-miterlimit="10"/>
  <path d="M15.1888 22.5478C16.2444 22.5478 17.1002 21.3069 17.1002 19.7762C17.1002 18.2455 16.2444 17.0046 15.1888 17.0046C14.1331 17.0046 13.2773 18.2455 13.2773 19.7762C13.2773 21.3069 14.1331 22.5478 15.1888 22.5478Z" fill="{lightColor}"/>
  <path d="M26.944 22.5478C27.9997 22.5478 28.8554 21.3069 28.8554 19.7762C28.8554 18.2455 27.9997 17.0046 26.944 17.0046C25.8884 17.0046 25.0326 18.2455 25.0326 19.7762C25.0326 21.3069 25.8884 22.5478 26.944 22.5478Z" fill="{lightColor}"/>
</svg>`,
      style: "",
      iconPath: "../../assets/tabbar/mine.png",
      selectedIconPath: "../../assets/tabbar/mine-selected.png"
    }],
  },
  methods: {
    calcStyle(svg: string, theme: Theme, selected) {
      svg = svg.replace(/{S}/,
        selected ? SelectedColor : DeselectedColor)

      const reg = /{(.+?)}/g;
      while(true) {
        const regRes = reg.exec(svg);
        if (!regRes) break;
        const val = theme[regRes[1]];
        svg = svg.replace(regRes[0], val);
      }

      const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      return `background-image: url(${dataUrl})`;
    },

    onThemeChanged(theme: Theme) {
      console.log("onThemeChanged", theme, this);
      theme ||= new Theme();
      const idx = this.data.curPageIndex;
      const pages = this.data.pages.map((page, i) => ({
        ...page, style: this.calcStyle(page.rawSvg, theme, i == idx)
      }));
      this.setData({ pages })
    },

    onTap(e) {
      const data = e.currentTarget.dataset
      const item = data.item;

      this.setData({ selected: data.index });
      if (item.pageIdx != undefined)
        pageMgr().switch(Pages[item.pageIdx]);
    },
  }
});
