package playerdata

import (
	"github.com/go-errors/errors"
	"homi-server-single/common/errs"
	"homi-server-single/models/room"
	"log"
	"time"
)

type PlayerRoom struct {
	PlayerData     `json:",inline" bson:",inline"`
	BuyRecords     []*SkinBuyRecord     `json:"buyRecords" bson:"buyRecords"`
	CollectRecords []*RoomCollectRecord `json:"collectRecords" bson:"collectRecords"`
	VisitRecords   []*RoomVisitRecord   `json:"visitRecords" bson:"visitRecords"`
}

// region 基本数据操作

//func (p PlayerRoom) GetID() string {
//	return p.ID
//}

//func (p PlayerRoom) GetCollection() *mongo.Collection {
//	return oprs.MongoOpr.Collection("PlayerRoom")
//}

//func (p PlayerRoom) Save() error {
//	err := myMongo.Save(p)
//	if err != nil {
//		return err
//	}
//	return nil
//}

//endregion

//region 用户数据处理

//func PlayerRoomData(openid string) (*PlayerRoom, error) {
//	room, err := PlayRoomRepo.FindOne(bson.D{{"openid", openid}})
//	if err != nil {
//		return nil, err
//	}
//	return pr, nil
//}

func (p *PlayerRoom) HasBought(skinId int64) bool {
	result := p.ExtractBoughtSkinRecord(skinId)
	if result == nil { //如果没有找到
		return false //没有购买
	}
	return true
}

func (p *PlayerRoom) GainSkin(skinId int64) error {
	hasBought := p.HasBought(skinId)
	if hasBought {
		log.Println("[Gain Skin] Error", "重复购买房间皮肤")
		return errors.New(errs.HasBoughtRoomErr)
	}
	err := p.CreateSkinBuyRecord(skinId)
	if err != nil {
		return err
	}
	return nil
}

//endregion

func NewPlayerRoom(openid string) *PlayerRoom {
	return &PlayerRoom{PlayerData{Openid: openid}, nil, nil, nil}
}

type RoomCollectRecord struct {
	RoomId     string `json:"roomId"`
	NpcRoomId  int64  `json:"npcRoomId"`
	Collected  bool   `json:"collected"`
	ChangeTime int64  `json:"changeTime"`
}

type RoomVisitRecord struct {
	RoomId    string `json:"roomId"`
	NpcRoomId int64  `json:"npcRoomId"`
	EnterTime int64  `json:"enterTime"`
	LeaveTime int64  `json:"leaveTime"`
}

type SkinBuyRecord struct {
	SkinId  int64 `json:"skinId"`
	BuyTime int64 `json:"buyTime" gorm:"autoCreateTime:milli"`
}

func (p *PlayerRoom) CreateSkinBuyRecord(skinId int64) {
	if p.BuyRecords == nil {
		p.BuyRecords = make([]*SkinBuyRecord, 10)
	}
	p.BuyRecords = append(p.BuyRecords, &SkinBuyRecord{
		SkinId:  skinId,
		BuyTime: time.Now().UnixMilli(),
	})
}

func (p *PlayerRoom) ExtractBoughtSkinRecord(skinId int64) *SkinBuyRecord {
	if p.BuyRecords == nil {
		return nil
	}
	for _, v := range p.BuyRecords {
		if v.SkinId == skinId {
			return v
		}
	}
	return nil
}

func (p *PlayerRoom) SwitchSkin(skinId int64) error {
	roomByOpenid, err := room.GetByOpenId(p.Openid)
	if err != nil {
		return err
	}
	err = roomByOpenid.SwitchSkin(skinId) //获取到对应的Room进行切换
	if err != nil {
		return err
	}
	return nil
}

func (p *PlayerRoom) CreateRoomCollectRecord(idx *room.IRoomIndex, collect bool) {
	record := &RoomCollectRecord{
		RoomId:     idx.RoomId,
		NpcRoomId:  idx.NpcRoom,
		Collected:  collect,
		ChangeTime: time.Now().UnixMilli(),
	}
	if p.CollectRecords == nil {
		p.CollectRecords = make([]*RoomCollectRecord, 10)
	}
	p.CollectRecords = append(p.CollectRecords, record)
}

//// GetVisiting 获取正在访问的房间访问记录
//func GetVisiting(openid string) *RoomVisitRecord {
//	target := &RoomVisitRecord{}
//
//	return target
//}
