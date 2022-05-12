import {pageMgr} from "../../modules/core/managers/PageManager";
import {MinePage} from "../../pages/mine/MinePage";
import {MainPage} from "../../pages/main/MainPage";
import {SquarePage} from "../../pages/square/SquarePage";

const Pages = [MainPage, SquarePage, MinePage];

Component({
    properties: {
        curPageIndex: {
            type: Number,
            value: 0
        },
    },
    data: {
        color: "#333333",
        selectedColor: "#1577ff",
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
                pageMgr().switch(Pages[item.pageIdx]).then();
            }
        },
    }
});
