package bots

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"homi-server/service/bot/opr"
	"homi-server/service/player/model"
)

const BotFlag = "Test"

func LoadRobots() []*model.Player {
	// {name: {$regex:/joe/}}
	//从数据库中Player加载所有机器人
	coll := opr.MongoOpr.Collection("Player")
	filter := bson.M{"openid": primitive.Regex{
		Pattern: BotFlag,
		Options: "i",
	}}
	cursor, err := coll.Find(context.TODO(), filter)
	if err != nil {
		panic(err)
	}
	result := make([]*model.Player, 50)
	if err := cursor.All(context.TODO(), &result); err != nil {
		panic(err)
	}
	return result
}

//获取在线的玩家的openid列表

//机器人按权重进入房间
