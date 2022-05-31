import {get, Itf, post} from "../../core/BaseAssist";
import {BaseManager, getManager, manager} from "../../core/managers/BaseManager";
import {Focus, FocusMode, RuntimeFocus} from "../data/Focus";
import {DataLoader} from "../../core/data/DataLoader";
import {IRoomIndex} from "../../room/data/PlayerRoom";

const StartFocus: Itf<
  {room: IRoomIndex, mode: FocusMode, tagIdx?: number, duration?: number},
  {focus: Partial<Focus>}> = post("/focus/focus/start");
const EndFocus: Itf<
  {runtime: RuntimeFocus, tagIdx?: number, note?: string},
  {focus: Partial<Focus>}> = post("/focus/focus/end");
const UpdateFocus: Itf<{runtime: RuntimeFocus}>
  = post("/focus/focus/update");
const CancelFocus: Itf<{reason?: string}, {focus: Partial<Focus>}>
  = post("/focus/focus/cancel");

export function focusMgr() {
  return getManager(FocusManager)
}

@manager
export class FocusManager extends BaseManager {

  public curFocus: Focus;

  // region 业务逻辑

  /**
   * 开始专注
   */
  public async startFocus(tagIdx: number, mode: FocusMode, duration: number) {
    const room = {roomId: "test123456789"}; // TODO: 测试房间，后面需要获取当前房间
    const response = await StartFocus({room, tagIdx, mode, duration});
    return this.curFocus = DataLoader.load(Focus, response.focus);
  }

  /**
   * 结束专注
   */
  public async endFocus(runtime: RuntimeFocus, tagIdx?: number, note?: string) {
    debugger;
    const response = await EndFocus({runtime, tagIdx, note});
    const res = DataLoader.load(Focus, response.focus);
    this.curFocus = null;
    return res;
  }

  /**
   * 取消专注
   */
  public async updateFocus(runtime: RuntimeFocus) {
    await UpdateFocus({runtime});
  }

  /**
   * 取消专注
   */
  public async cancelFocus(reason?: string) {
    const response = await CancelFocus({reason});
    const res = DataLoader.load(Focus, response.focus);
    this.curFocus = null;
    return res;
  }

  // endregion
}
