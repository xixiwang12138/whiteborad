import {Itf, post} from "../../core/BaseAssist";
import {IRoomIndex} from "../data/PlayerRoom";
import {RoomData} from "../data/Room";
import {NPCRoom} from "../data/NPCRoom";
import {BaseManager, getManager, manager} from "../../core/managers/BaseManager";

const GetRoom: Itf<
  {room: IRoomIndex},
  {room?: RoomData, npcRoom: NPCRoom}> = post("/room/room/get");

export function roomMgr() {
  return getManager(RoomManager)
}

@manager
export class RoomManager extends BaseManager {

  public enterRoom() {

  }

  public leaveRoom() {

  }

}
