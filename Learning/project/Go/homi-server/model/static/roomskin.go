package static

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"homi-server-single/common/data"
	"homi-server-single/common/data/myMongo"
	"homi-server-single/models/opr"
	"log"
)

type RoomSkin struct {
	ID               string            `json:"_id" bson:"_id,omitempty"`
	SkinID           int64             `json:"id" bson:"id"`
	Thumbnail        string            `json:"thumbnail" bson:"thumbnail"`
	Picture          string            `json:"picture" bson:"picture"`
	DisplayName      interface{}       `json:"displayName" bson:"displayName"`
	Name             string            `json:"name" bson:"name"`
	Description      string            `json:"description" bson:"description"`
	Layers           []*PictureLayer   `json:"layers" bson:"layers"`
	Animations       []*Animation      `json:"animations" bson:"animations"`
	BaseId           int               `json:"baseId" bson:"baseId"`
	Level            int               `json:"level" bson:"level"`
	Params           [2]float64        `json:"params" bson:"params"`
	Background       string            `json:"background" bson:"background"`
	BackgroundColors [2]string         `json:"backgroundColors" bson:"backgroundColors"`
	Conditions       []*data.Condition `json:"conditions" bson:"conditions"`
	Price            int               `json:"price" bson:"price"`
}

func (r RoomSkin) GetID() string {
	return r.ID
}

func (r RoomSkin) GetCollection() *mongo.Collection {
	return opr.MongoOpr.Collection("RoomSkin")
}

func (r RoomSkin) Save() error {
	err := myMongo.Save(r)
	if err != nil {
		return err
	}
	return nil
}

func RoomSkins() []*RoomSkin {
	empty := RoomSkin{}
	cursor, err := empty.GetCollection().Find(context.TODO(), bson.D{{}})
	defer cursor.Close(context.Background())
	if err != nil {
		panic(err)
	}
	skins := make([]*RoomSkin, 30)
	err = cursor.All(context.TODO(), &skins)
	if err != nil {
		log.Println("[MongoDB] Read All Room Skin Err ", err)
		return nil
	}
	return skins
}

func GetSkin(skinId int64) (*RoomSkin, error) {
	result := &RoomSkin{}
	err := myMongo.FindOne(result.GetCollection(), "id", skinId, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

type PictureLayer struct {
	Name     string     `json:"name"`
	Picture  string     `json:"picture"`
	Z        int        `json:"z"`
	Position [2]float64 `json:"position"`
	Anchor   [2]float64 `json:"anchor"`
}

const (
	AnimationTypeNormal = 0
	AnimationTypeFocus  = 0
)

type Animation struct {
	Type int `json:"type" bson:"type"` //AnimationTypeNormal或者AnimationTypeFocus
	// 是否人物动作
	// 如果是人物动作，则不能同时出现，而且会有淡入淡出效果
	IsCharacter bool       `json:"isCharacter" bson:"isCharacter"`
	MotionId    int        `json:"motionId" bson:"motionId"` // 关联的Motion
	Count       int        `json:"count" bson:"count"`       // 持续帧数
	Duration    float64    `json:"duration" bson:"duration"` // 单次播放时长（秒）
	Repeat      int        `json:"repeat" bson:"repeat"`     // 最少重复播放次数（如果关联了Motion，该字段无效，因为Motion播放固定时长为1分钟）
	Rate        float64    `json:"rate" bson:"rate"`         // 出现概率（如果关联了Motion，按Motion的来算）
	Z           int        `json:"z" bson:"z"`               // Z坐标
	Position    [2]float64 `json:"position" bson:"position"` // 位置（按百分比）
	Anchor      [2]float64 `json:"anchor" bson:"anchor"`     // 锚点
}
