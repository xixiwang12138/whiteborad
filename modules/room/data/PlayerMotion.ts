import {BaseData} from "../../core/data/BaseData";
import {DataLoader, field} from "../../core/data/DataLoader";
import {PlayerData} from "../../player/data/Player";
import {playerData, playerMgr} from "../../player/managers/PlayerManager";
import {motionRepo} from "./Motion";
import {CloudFileUtils} from "../../../utils/CloudFileUtils";
import {roomMgr} from "../managers/RoomManager";
import {PlayerRoom} from "./PlayerRoom";

export class PlayerMotionRecord extends BaseData {

    @field(Number)
    public motionId: number;
    @field(Number)
    public count: number;
    @field(Number)
    public unlockTime: number;
    @field(Number)
    public rewardTime?: number;

    // create(motionId:number):PlayerMotionRecord{
    //     let res = new PlayerMotionRecord();
    //     res.motionId = motionId;
    //     res.rewardTime = Date.now();
    //     return res;
    // }
}

export class PlayerMotion extends PlayerData {

    @field([PlayerMotionRecord])
    public records: PlayerMotionRecord[] = []

    public async refresh() {
        const pm = await roomMgr().getPlayerMotion();
        this.records = pm.records;
    }

    /**
     * 已解锁的动作Id列表
     */
    public get unlockMotionsIds() {
        return this.records.map(br => br.motionId);
    }

    /**
     * 获得奖励
     * @param skinId
     */
    public gain(motionId) {
        let playerMotionRecord = this.records.find(pm => pm.motionId == motionId);
        if(playerMotionRecord == undefined)return;          //未解锁动作
        if(playerMotionRecord.rewardTime != null)return;    //已领取动作奖励
        this.records[this.records.indexOf(playerMotionRecord)].rewardTime = Date.now();
    }
    public getUnlock(motionId) {
        return this.records.find(pm => pm.motionId == motionId);
    }
    public getGained(motionId){
        return this.records.find(pm=> pm.rewardTime == null)
    }
}
