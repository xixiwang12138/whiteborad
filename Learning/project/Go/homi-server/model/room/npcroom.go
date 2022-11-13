package room

import (
	"go.mongodb.org/mongo-driver/mongo"
	"homi-server-single/common/data"
	"homi-server-single/common/data/myMongo"
	"homi-server-single/models/opr"
	"homi-server-single/models/static"
)

const (
	NPCRoomStateClosed   = -2
	NPCRoomStateBuilding = -1
	Opened               = 0
)

const (
	NPCRoomTypeNPC        = 0
	NPCRoomTypeFunctional = 1
)

type NPCRoom struct {
	ID          string                `json:"_id" bson:"_id,omitempty"`
	PK          int64                 `json:"id" bson:"id"`
	DisplayName string                `json:"displayName" bson:"displayName"`
	Name        string                `json:"name" bson:"name"`
	Thumbnail   string                `json:"thumbnail" bson:"thumbnail"` // 缩略图（如果不提供，根据图层来绘制）
	Picture     string                `json:"picture" bson:"picture"`
	Layers      []static.PictureLayer `json:"layers" bson:"layers"`
	Animations  []static.Animation    `json:"animations" bson:"animations"`
	Params      [2]float64            `json:"params" bson:"params"`
	//TODO effects traits
	Type       int              `json:"type" bson:"type"` //枚举
	Page       string           `json:"page" bson:"page"`
	Rate       float64          `json:"rate" bson:"rate"`
	Conditions []data.Condition `json:"conditions" bson:"conditions"`
	State      int              `json:"state" bson:"state"` //枚举
}

func GetByNpcRoomId(npcPK int64) (*NPCRoom, error) {
	result := &NPCRoom{}
	err := myMongo.FindOne(result.GetCollection(), "id", npcPK, result)
	if result == nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (N NPCRoom) GetID() string {
	return N.ID
}

func (N NPCRoom) GetCollection() *mongo.Collection {
	return opr.MongoOpr.Collection("NPCRoom")
}

func (N NPCRoom) Save() error {
	err := myMongo.Save(N)
	if err != nil {
		return err
	}
	return nil
}

func (u *NPCRoom) Param(index ParamType) float64 {
	return u.Params[index]
}

func (u *NPCRoom) GetGoldBonus() float64 {
	return u.Param(GB)
}

func (u *NPCRoom) GetExpBonus() float64 {
	return u.Param(EB)
}

//func ConditionGetNPCRoom(con *NPCRoom) (*NPCRoom, error) {
//	res := &NPCRoom{}
//	err := DbOpr.Model(con).Where(con).First(res).Error
//	if err != nil {
//		return nil, err
//	}
//	return res, nil
//}
