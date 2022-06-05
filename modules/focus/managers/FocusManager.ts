import {get, Itf, post} from "../../core/BaseAssist";
import {BaseManager, getManager, manager} from "../../core/managers/BaseManager";
import {Focus, FocusMode, RuntimeFocus} from "../data/Focus";
import {DataLoader} from "../../core/data/DataLoader";
import {IRoomIndex} from "../../room/data/PlayerRoom";
import {blockLoading} from "../../core/managers/LoadingManager";
import {roomMgr} from "../../room/managers/RoomManager";
import {RewardGroup} from "../../player/data/Reward";

const StartFocus: Itf<
  {room: IRoomIndex, mode: FocusMode, tagIdx?: number, duration?: number},
  {focus: Partial<Focus>}> = post("/focus/focus/start");
const EndFocus: Itf<{runtime: RuntimeFocus},
  {focus: Partial<Focus>}> = post("/focus/focus/end");
const EditFocus: Itf<{focusId: string, tagIdx: number, note: string}>
  = post("/focus/focus/edit");
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
  public curRewards: RewardGroup;

  // region 业务逻辑

  /**
   * 开始专注
   */
  public async startFocus(tagIdx: number, mode: FocusMode, duration: number) {
    const room = await roomMgr().getSelfRoom();
    // const room = {roomId: "test123456789"}; // TODO: 测试房间，后面需要获取当前房间
    const response = await StartFocus({room, tagIdx, mode, duration});

    roomMgr().onFocusStart();

    return this.curFocus = DataLoader.load(Focus, response.focus);
  }

  /**
   * 结束专注
   */
  public async endFocus(runtime: RuntimeFocus, tagIdx?: number, note?: string) {
    const response = await EndFocus({runtime});

    roomMgr().onFocusEnd();

    const res = DataLoader.load(Focus, response.focus);
    const rewards = this.curRewards = await res.realRewards();
    rewards.invoke(); // 执行奖励

    this.curFocus = null;
    return res;
  }

  /**
   * 修改专注
   */
  public async editFocus(focusId: string, tagIdx: number, note: string) {
    await EditFocus({focusId, tagIdx, note});
  }

  /**
   * 取消专注
   */
  @blockLoading
  public updateFocus(runtime: RuntimeFocus) {
    return UpdateFocus({runtime});
  }

  /**
   * 取消专注
   */
  public async cancelFocus(reason?: string) {
    const response = await CancelFocus({reason});

    roomMgr().onFocusEnd();

    const res = DataLoader.load(Focus, response.focus);
    this.curFocus = null;
    return res;
  }

  // endregion
}
