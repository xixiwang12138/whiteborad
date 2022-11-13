package focus

import (
	"homi-server/common/data"
	"homi-server/common/utils"
	"homi-server/models/playerdata"
	"homi-server/models/room"
	"math"
	"time"
)

const (
	MaxG = float64(300)
	MaxD = float64(210)
	K    = float64(0.1)
	MinK = float64(0.5)
)

type Mode int8

const (
	NormalFocusMode = 0
	FlipFocusMode   = 1
	BrightFocusMode = 2
)

type State int8

const (
	StateNotStart = -2
	StateStarted  = -1
	StateFinished = 0
	StateFailed   = 1
	StateAbnormal = 2
)

type Focus struct {
	playerdata.PlayerData `json:",inline" bson:",inline"`
	RoomId                string         `json:"roomId" bson:"roomId"`
	NpcRoomId             int64          `json:"npcRoomId" bson:"npcRoomId"`
	TagIdx                int            `json:"tagIdx" bson:"tagIdx"`
	Note                  string         `json:"note" bson:"note"`
	Mode                  Mode           `json:"mode" bson:"mode"`
	Duration              int64          `json:"duration" bson:"duration"`
	StartTime             int64          `json:"startTime" bson:"startTime"`
	EndTime               int64          `json:"endTime" bson:"endTime"`
	Rewards               []*data.Reward `json:"rewards" bson:"rewards"`
	State                 State          `json:"state" bson:"state"`
	StateDesc             string         `json:"stateDesc" bson:"stateDesc"`

	RuntimeID string `json:"runtime"` //持久化维护指向Runtime的指针
}

func (u Focus) GetMongoId() string {
	//TODO implement me
	panic("implement me")
}

func (u Focus) GetBusinessId() string {
	//TODO implement me
	panic("implement me")
}

func NewFocus(openid string, roomId string, mode int, tagIndex int, duration int) *Focus {
	f := &Focus{}
	f.Openid = openid
	f.Mode = Mode(mode)
	f.State = StateNotStart
	f.Duration = int64(duration)
	f.RoomId = roomId
	f.TagIdx = tagIndex
	return f
}

//region gorm
//func (u *Focus) BeforeCreate(tx *gorm.DB) (err error) {
//	node, err := snowflake.NewNode(1)
//	u.ID_ = int64(node.Generate())
//	return err
//}
//
//func (u *Focus) TableName() string {
//	return "focus"
//}
//endregion

//region 数据操作

//endregion

//func (u Focus) GetID() string {
//	return u.ID
//}
//
//func (u Focus) GetCollection() *mongo.Collection {
//	return opr.MongoOpr.Collection("Focus")
//}
//
//func (u Focus) Save() error {
//	err := myMongo.Save(u)
//	if err != nil {
//		return err
//	}
//	return nil
//}

//func GetByPK(pk string) (*Focus, error) {
//	result := &Focus{}
//	err := myMongo.FindOne(result.GetCollection(), "id", pk, result)
//	if err != nil {
//		return nil, err
//	}
//	if result.ID == "" {
//		return nil, nil
//	}
//	return result, nil
//}

//region 流程控制

func (u *Focus) Start() {
	u.StartTime = time.Now().UnixMilli()
	u.State = StateStarted
}

func (u *Focus) Cancel(reasonOrAbnormal interface{}) {
	u.EndTime = time.Now().UnixMilli()
	switch reasonOrAbnormal.(type) {
	case string:
		u.State = StateFailed
		u.StateDesc = reasonOrAbnormal.(string)
		break
	case bool:
		if reasonOrAbnormal.(bool) {
			u.State = StateFailed
		} else {
			u.State = StateAbnormal
		}
	}
}

func (u *Focus) End(runtime *RuntimeFocus) {
	u.EndTime = time.Now().UnixMilli()
	u.State = StateFinished
	//TODO 更新runtime
	//奖励的计算
	u.CalculateReward()
}

func (u *Focus) Edit(tagIdx int, note string) {
	u.TagIdx = tagIdx
	u.Note = note
}

//endregion

//region 奖励计算

func (u *Focus) BaseReward() float64 {
	return 0
}

func (u *Focus) CalculateReward() {
	//构造基本奖励
	d := float64(u.Duration)
	gold := math.Round(math.Max(d*MinK, MaxG*utils.Sigmoid(d/MaxD-0.5)/K))
	exp := d * K
	r1 := data.NewReward(data.GoldReward, gold, u.Openid) //金币奖励
	r2 := data.NewReward(data.ExpReward, exp, u.Openid)   //经验奖励

	var ownerR *data.Reward

	//根据玩家所在房间进行奖励对象的加成（修改bonus对象）
	if u.InNpcRoom() {
		npcRoom, _ := room.GetByNpcRoomId(u.NpcRoomId)
		gb := npcRoom.GetGoldBonus()
		eb := npcRoom.GetExpBonus()
		r1.BonusUp(gb, 0) //TODO rate?????
		r2.BonusUp(eb, 0) //TODO rate?????
	} else {
		pRoom, _ := room.GetByRoomId(u.RoomId)
		gb := pRoom.GetGoldBonus()
		eb := pRoom.GetExpBonus()

		//在自己的房间内专注
		if pRoom.Openid == u.Openid {
			r1.BonusUp(gb, 0) //TODO rate?????
			r2.BonusUp(eb, 0) //TODO rate?????
		} else {
			//在其他人的房间内专注
			r1.BonusUp(gb*(1-pRoom.FeeRate), 0) //TODO rate?????
			r2.BonusUp(eb, 0)                   //TODO rate?????

			//房间主人只获得金币奖励
			ownerR = data.NewReward(data.GoldReward, gold, pRoom.Openid)
			ownerR.BonusUp(gb*pRoom.FeeRate-1, 0)
		}
	}

	//将计算结果进行处理
	res := make([]*data.Reward, 2)
	res[0] = r1
	res[1] = r2
	if ownerR != nil {
		res = append(res, ownerR)
	}
	u.Rewards = res
}

//endregion

func (u *Focus) InNpcRoom() bool {
	if u.RoomId == "" && u.NpcRoomId != 0 {
		//npc房间
		return true
	}
	return false
}
