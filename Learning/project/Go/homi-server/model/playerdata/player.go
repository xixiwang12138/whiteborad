package playerdata

import (
	"math"
)

// 状态常量
const (
	NewerPlayer  int8 = 0
	NormalPlayer int8 = 1
	BannedPlayer int8 = 2
)

const (
	DefaultGold = 200
	DefaultExp  = 0
)

type PlayerBaseInfo struct {
	PlayerData `json:",inline" bson:",inline"`
	ChainId    int64  `json:"-" bson:"chainId"`
	Address    string `json:"-" bson:"address"` //钱包地址
	Name       string `json:"name" bson:"name"`
	Gender     int8   `json:"gender" bson:"gender"`
	NickName   string `json:"nickName" bson:"nickName"`
	Phone      string `json:"-" bson:"phone"`
	AvatarUrl  string `json:"avatar" bson:"avatar"`
	//Level     int    `json:"level" bson:"level"`
	Slogan string `json:"slogan" bson:"slogan"`
}

type Player struct {
	PlayerBaseInfo `json:",inline" bson:",inline"`
	Description    string `json:"description" bson:"description"`
	Exp            int    `json:"exp" bson:"exp"`
	Score          int    `json:"score" bson:"score"`
	InviteCode     string `json:"inviteCode" bson:"inviteCode"`
	Gold           int    `json:"gold" bson:"gold"`

	CreateTime int64 `json:"createTime" bson:"createTime"`

	//StateData
	State     int8   `json:"state" bson:"state"`
	StateTime int64  `json:"stateTime" bson:"stateTime"`
	StateDesc string `json:"stateDesc" bson:"stateDesc"`
}

type PlayerEditableInfo struct {
	Name      string `json:"name" bson:"name"`
	Gender    int8   `json:"gender" bson:"gender"`
	NickName  string `json:"nickName" bson:"nickName"`
	Phone     string `json:"-" bson:"phone"`
	AvatarUrl string `json:"avatar" bson:"avatar"`
	Slogan    string `json:"slogan" bson:"slogan"`
}

//func (u Player) GetID() string {
//	return u.ID
//}
//
//func (u Player) GetCollection() *mongo.Collection {
//	return oprs.MongoOpr.Collection("Player")
//}
//
//func (u Player) Save() error {
//	return myMongo.Save(u)
//}

func (u *Player) GainExp(exp float64) {
	u.Exp = int(math.Ceil(exp)) + u.Exp
}

func (u *Player) GainGold(gold float64) {
	//filter := bson.D{{"_id", u.ID}}
	//gainGold := bson.D{{"$set", bson.D{{"gold", int(math.Ceil(gold)) + u.Gold}}}}
	//_, err := u.GetCollection().UpdateOne(context.TODO(), filter, gainGold)
	u.Gold = int(math.Ceil(gold)) + u.Gold
}

func (u *Player) ConsumeGold(price int) {
	u.Gold -= price
	//err := u.Save()
	//if err != nil {
	//	return err
	//}
	//return nil
}

//func GetBaseInfo(openid string) (*PlayerBaseInfo, error) {
//	player :=
//	err := myMongo.FindOne(player.GetCollection(), "openid", openid, baseResult)
//	if err != nil {
//		return nil, err
//	}
//	return baseResult, nil
//}

//region mysql相关操作

//func (u *Player) BeforeCreate(tx *gorm.DB) (err error) {
//	node, err := snowflake.NewNode(1) //
//	u.ID_ = int64(node.Generate())
//	u.State = NewerPlayer
//	return err
//}
//
//func (u *Player) TableName() string {
//	return "player"
//}

//endregion
