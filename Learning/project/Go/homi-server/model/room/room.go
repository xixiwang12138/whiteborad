package room

import (
	"go.mongodb.org/mongo-driver/mongo"
	"homi-server-single/common/data/myMongo"
	"homi-server-single/models/opr"
	"homi-server-single/models/playerdata"
	"homi-server-single/models/static"
	"strconv"
)

type IRoomIndex struct {
	RoomId  string `json:"roomId"`
	NpcRoom int64  `json:"npcRoom"`
}

func (idx *IRoomIndex) IsNpcRoom() bool {
	return idx.NpcRoom != 0
}

type RoomEditableInfo struct {
	Name   string `json:"name"`
	Notice string `json:"notice"`
}

const (
	NotCreatedRoom = 0
	CreatedRoom    = 1
	BannedRoom     = 2
)

type ParamType int8

const (
	GB ParamType = 0 //金币加成
	EB ParamType = 1 //经验加成
)

type Room struct {
	ID        string     `json:"_id" bson:"_id,omitempty"`
	RoomId    string     `json:"roomId" bson:"roomId"`
	DisplayId string     `json:"displayId" bson:"displayId"`
	Name      string     `json:"name" bson:"name"`
	Openid    string     `json:"openid" bson:"openid"` //用户的唯一标识
	Notice    string     `json:"notice" bson:"notice"`
	StarId    int        `json:"starId" bson:"starId"`
	Params    [2]float64 `json:"params" bson:"params"`

	// TODO
	//  Traits string `json:"traits"`
	//	Effects     string  `json:"effects"`

	FeeRate    float64 `json:"feeRate"` //默认0.5
	State      int     `json:"state"`
	CreateTime int64   `json:"createTime"`

	Description string `json:"description"`
	Thumbnail   string `json:"thumbnail"` // 缩略图（如果不提供，根据图层来绘制）
	Picture     string `json:"picture"`

	SkinId int64 `json:"skinId"`

	IsNpc bool `json:"-"`
	// Player *model.PlayerBaseInfo `json:"player,omitempty" gorm:"-:migration"`
}

func NewRoom() *Room {
	return &Room{FeeRate: 0.5, SkinId: 1, StarId: 1, State: NotCreatedRoom}
}

func (u Room) GetID() string {
	return u.ID
}

func (u Room) GetCollection() *mongo.Collection {
	return opr.MongoOpr.Collection("Room")
}

func (u Room) Save() error {
	err := myMongo.Save(u)
	if err != nil {
		return err
	}
	return nil
}

func GetRoom[T Room | NPCRoom](roomIdx *IRoomIndex) (interface{}, error) { //TODO 返回泛型？？
	if roomIdx.IsNpcRoom() {
		npcRoom, err := GetByNpcRoomId(roomIdx.NpcRoom)
		if err != nil {
			return nil, err
		}
		return npcRoom, nil
	} else {
		room, err := GetByRoomId(roomIdx.RoomId)
		if err != nil {
			return nil, err
		}
		return room, nil
	}
}

//func (u Room) FillPlayer() error {
//	p, err := pb.GetBasePlayerInfoRpc(u.Openid)
//	if err != nil {
//		return err
//	}
//	u.Player = p
//	return nil
//}
//
//func ConditionGetRooms(con *Room, additionQuery map[string]interface{}) ([]Room, error) {
//	var fs []Room //注意多条查询的时候这里为原始结构
//	db := DbOpr.Model(con)
//	if additionQuery != nil {
//		for k, v := range additionQuery {
//			db = db.Where(k, v)
//		}
//	}
//	err := db.Where(con).Find(&fs).Error //Find里面为指针
//	if err != nil {
//		return nil, err
//	}
//	return fs, nil
//}
//
//func ConditionGetRoom(con *Room, additionQuery map[string]interface{}) (*Room, error) {
//	rooms, err := ConditionGetRooms(con, additionQuery)
//	if err != nil {
//		return nil, err
//	}
//	if rooms == nil || len(rooms) == 0 {
//		return nil, errors.New(errs.NoRoomErr)
//	}
//	return &rooms[0], nil
//}

//func GetPlayerRoom(openid string) (*Room, error) {
//	return ConditionGetRoom(&Room{Openid: openid}, nil)
//}

func GetByRoomId(roomId string) (*Room, error) {
	result := &Room{RoomId: roomId}
	err := myMongo.FindOne(result.GetCollection(), "roomId", roomId, result)
	if result.ID == "" { //没有找到不反悔错误，返回nil
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return result, nil
}

func GetByOpenId(openid string) (*Room, error) {
	result := &Room{Openid: openid}
	err := myMongo.FindOne(result.GetCollection(), "openid", openid, result)
	if result.ID == "" { //没有找到不返回错误，返回nil
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return result, nil
}

func FlatIndex(room *IRoomIndex) string {
	var roomID string
	if room.RoomId == "" {
		roomID = strconv.Itoa(int(room.NpcRoom))
	} else {
		roomID = room.RoomId
	}
	return roomID
}

//region 流程控制

func (u Room) SwitchSkin(skinId int64) error {
	//todo 缓存
	u.SkinId = skinId
	err := u.Save()
	if err != nil {
		return err
	}
	return nil
}

//endregion

type WithPlayer struct {
	ID        string     `json:"_id" bson:"_id,omitempty"`
	RoomId    string     `json:"roomId" bson:"roomId"`
	DisplayId string     `json:"displayId" bson:"displayId"`
	Name      string     `json:"name" bson:"name"`
	Openid    string     `json:"openid" bson:"openid"` //用户的唯一标识
	Notice    string     `json:"notice" bson:"notice"`
	StarId    int        `json:"starId" bson:"starId"`
	Params    [2]float64 `json:"params" bson:"params"`

	// TODO
	//  Traits string `json:"traits"`
	//	Effects     string  `json:"effects"`

	FeeRate    float64 `json:"feeRate"` //默认0.5
	State      int     `json:"state"`
	CreateTime int64   `json:"createTime"`

	Description string `json:"description"`
	Thumbnail   string `json:"thumbnail"` // 缩略图（如果不提供，根据图层来绘制）
	Picture     string `json:"picture"`

	SkinId int64 `json:"skinId"`

	IsNpc     bool   `json:"-"`
	NickName  string `json:"playerName"`
	AvatarUrl string `json:"playerAvatarUrl"`
}

func (u *Room) Fetch(player *playerdata.Player) *WithPlayer {
	res := &WithPlayer{}
	res.AvatarUrl = player.AvatarUrl
	res.NickName = player.NickName
	return res
}

func (u *Room) Skin() (*static.RoomSkin, error) {
	skin, err := static.GetSkin(u.SkinId)
	if err != nil {
		return nil, err
	}
	return skin, nil
}

func (u *Room) Param(index ParamType) float64 {
	base := u.Params[index]
	skin, err := u.Skin()
	if err != nil || skin == nil {
		//TODO 处理错误
		return base
	}
	return skin.Params[index] + base
}

func (u *Room) GetGoldBonus() float64 {
	return u.Param(GB)
}

func (u *Room) GetExpBonus() float64 {
	return u.Param(EB)
}
