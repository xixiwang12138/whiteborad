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

export type RoomMessageType = "enter" | "leave" | "focusStart" | "focusEnd";
export type RoomMessage = {
  type: RoomMessageType,
  time: number, player: PlayerBaseInfo
}

const CloseCode = 3005;

export function roomMgr() {
  return getManager(RoomManager)
}

@manager
export class RoomManager extends BaseManager {

  public selfRoom: Room;
  public socket: SocketTask;

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
    await EnterRoom({room});
    const wsRoomId = room.roomId || room.npcRoomId.toString();
    // TODO: 临时代码
    this.socket = wsMgr().connect(RoomType, [wsRoomId], onMessage);
  }

  public async leaveRoom() {
    await LeaveRoom();
    // TODO: 临时代码
    wsMgr().close(this.socket, CloseCode);
    this.socket = null;
  }

  public onFocusStart() {
    if (!this.socket) return;
    // TODO: 临时代码
    const data = JSON.stringify({type: "focusStart"});
    this.socket.send({data});
  }
  public onFocusEnd() {
    if (!this.socket) return;
    // TODO: 临时代码
    const data = JSON.stringify({type: "focusEnd"});
    this.socket.send({data});
  }

}
