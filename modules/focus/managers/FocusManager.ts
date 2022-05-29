import {get, Itf, post} from "../../core/BaseAssist";
import {BaseManager, getManager, manager} from "../../core/managers/BaseManager";
import {Focus, FocusMode} from "../data/Focus";
import {DataLoader} from "../../core/data/DataLoader";

const StartFocus: Itf<
  {tagIdx?: number, mode: FocusMode, duration?: number},
  {focus: Focus}> = post("/focus/focus/start");

export function focusMgr() {
  return getManager(FocusManager)
}

@manager
export class FocusManager extends BaseManager {

  public curFocus: Focus;

  // region 业务逻辑

  public async startFocus(tagIdx: number, mode: FocusMode, duration: number) {
    const response = await StartFocus({tagIdx, mode, duration});
    return this.curFocus = DataLoader.load(Focus, response.focus);
  }

  // endregion
}
