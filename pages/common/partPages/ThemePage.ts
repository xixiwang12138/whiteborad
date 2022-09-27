import {PartialPage} from "../core/BasePage";
import {BaseData} from "../../../modules/core/data/BaseData";
import {Theme, themeRepo} from "../../../modules/room/data/Theme";
import {DataOccasion, field, occasion} from "../../../modules/core/data/DataLoader";

class Data extends BaseData {
  @field(Theme)
  public theme: Theme
}

export class ThemePage extends PartialPage<Data> {

  public data = new Data();

  constructor() {
    super();
    console.log("ThemePage", this);
  }

  public setTheme(theme: Theme) {
    this.setData({theme});
  }
  public setThemeId(themeId: number) {
    const theme = themeRepo().getById(themeId);
    this.setData({theme});
  }

}
