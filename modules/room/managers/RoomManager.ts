import {get, Itf, post} from "../../core/BaseAssist";
import {IRoomIndex, PlayerRoom} from "../data/PlayerRoom";
import {Room, RoomEditableInfo, RoomInfo} from "../data/Room";
import {NPCRoom} from "../data/NPCRoom";
import {BaseManager, getManager, manager} from "../../core/managers/BaseManager";
import {DataLoader, DataOccasion} from "../../core/data/DataLoader";
import {wsMgr} from "../../websocket/WebSocketManager";
import {RoomType} from "../../../pages/main/MainPage";
import {PlayerBaseInfo} from "../../player/data/Player";
import SocketTask = WechatMiniprogram.SocketTask;
import {roomSkinRepo} from "../data/RoomSkin";
import {playerMgr} from "../../player/managers/PlayerManager";
import {MotionRecord, RuntimeFocus} from "../../focus/data/Focus";

const GetRoom: Itf<{room: IRoomIndex},
  {room?: Partial<Room>, npcRoom?: Partial<NPCRoom>}>
  = get("/room/room/get");
const GetRooms: Itf<
  {offset: number, count: number, text?: string, filter?: any},
  {rooms?: Partial<RoomInfo>[], npcRooms?: Partial<NPCRoom>[]}>
  = get("/room/room/get_list");
const GetSelfRoom: Itf<{}, {room: Partial<Room>}>
  = get("/room/room/get_self");

const EditRoomInfo: Itf<{info: RoomEditableInfo}>
  = post("/room/room_info/edit");

const CollectRoom: Itf<{room: IRoomIndex, collect: boolean}>
  = post("/room/room/collect");

const BuySkin: Itf<{skinId: number}> = post("/room/skin/buy");
const SwitchSkin: Itf<{skinId: number}> = post("/room/skin/switch");

const EnterRoom: Itf<{room: IRoomIndex}> = post("/room/room/enter");
const LeaveRoom: Itf = post("/room/room/leave");

export type RoomMessageType = "enter" | "leave" | "focusStart" | "focusEnd" | "focusing"|"switchMotion";
export type RoomMessage = {
  type: RoomMessageType, time: number,
  player?: PlayerBaseInfo,
  count?: number,
  motionRecord:MotionRecord
}

const CloseCode = 3005;

export function roomMgr() {
  return getManager(RoomManager)
}

@manager
export class RoomManager extends BaseManager {

  public selfRoom: Room;
  public socket: SocketTask;

  // region RoomIndex转化

  public room2Str(room: IRoomIndex) {
    return room.roomId || room.npcRoomId.toString();
  }
  public str2Room(strRoom: string): IRoomIndex {
    if (!!Number(strRoom)) return {npcRoomId: Number(strRoom)};
    return {roomId: strRoom};
  }
  public roomEql(room1: IRoomIndex, room2: IRoomIndex) {
    return this.room2Str(room1) == this.room2Str(room2);
  }

  // endregion

  // region 业务逻辑

  public async getRoom(room: IRoomIndex) {
    const response = await GetRoom({room});
    return response.room ?
      DataLoader.load(DataOccasion.Interface, Room, response.room) :
      DataLoader.load(NPCRoom, response.npcRoom);
  }
  public async getRooms(offset: number, count: number,
                        text: string = "", filter: any = {}) {
    const response = await GetRooms({offset, count, text, filter});
    return {
      rooms: response.rooms.map(r => DataLoader.load(RoomInfo, r)),
      npcRooms: response.npcRooms.map(r => DataLoader.load(NPCRoom, r))
    }
  }
  public async getSelfRoom() {
    return this.selfRoom ||= DataLoader.load(
      Room, (await GetSelfRoom()).room);
  }

  public async editRoomInfo(info: RoomEditableInfo) {
    await EditRoomInfo({info});
    const room = await roomMgr().getSelfRoom();
    room.editInfo(info);
  }
  public async buySkin(skinId: number) {
    const skin = roomSkinRepo().getById(skinId);
    const cond = skin.buyConditions();
    await cond.check();

    await BuySkin({skinId});

    await cond.process();
    const pr = playerMgr().getData(PlayerRoom);
    pr.buy(skinId);
  }
  public async switchSkin(skinId: number) {
    await SwitchSkin({skinId});
    const room = await roomMgr().getSelfRoom();
    room.switchSkin(skinId);
  }

  public async enterRoom(room: IRoomIndex,
                         onMessage: (data: RoomMessage) => any) {
    if (this.socket) await this.leaveRoom();
    // await EnterRoom({room});
    const roomStr = this.room2Str(room);
    // TODO: 临时代码
    this.socket = wsMgr().connect(RoomType, [roomStr], onMessage);
  }

  public async leaveRoom() {
    // await LeaveRoom();
    // TODO: 临时代码
    wsMgr().close(this.socket, CloseCode);
    this.socket = null;
  }

  public updateRoomFocus(runtime: RuntimeFocus) {
    if (!this.socket) return;
    const runtimeFocus = DataLoader.convert(runtime);
    const data = JSON.stringify({
      type: "focusUpdate", runtimeFocus
    })
    this.socket.send({data});
  }

  public syncPlayerRoomRecords

  // endregion

  // public onFocusStart() {
  //   if (!this.socket) return;
  //   // TODO: 临时代码
  //   const data = JSON.stringify({type: "focusStart"});
  //   this.socket.send({data});
  // }
  // public onFocusEnd() {
  //   if (!this.socket) return;
  //   // TODO: 临时代码
  //   const data = JSON.stringify({type: "focusEnd"});
  //   this.socket.send({data});
  // }

}
