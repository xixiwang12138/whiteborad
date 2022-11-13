package static

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"homi-server-single/common/data"
	"homi-server-single/models/opr"
	"log"
)

const (
	MotionRareN   = 0
	MotionRareR   = 1
	MotionRareSR  = 2
	MotionRareSRR = 3
	MotionRareUR  = 4
)

type Motion struct {
	ID            string            `json:"_id" bson:"_id,omitempty"` //数据库主键
	MotionID      int64             `json:"id" bson:"id"`             //业务主键
	DisplayName   string            `json:"displayName" bson:"displayName"`
	Name          string            `json:"name" bson:"name"`
	Description   string            `json:"description" bson:"description"`
	Thumbnail     string            `json:"thumbnail" bson:"thumbnail"`
	Rate          float64           `json:"rate" bson:"rate"`
	MotionRare    int8              `json:"rare" bson:"rare"`
	Conditions    []*data.Condition `json:"conditions" bson:"conditions"`
	UnlockRewards []*data.Reward    `json:"unlockRewards" bson:"unlockRewards"`
	Rewards       []*data.Reward    `json:"rewards" bson:"rewards"`
}

func MotionCollection() *mongo.Collection {
	return opr.MongoOpr.Collection("Motion")
}

func Motions() []*Motion {
	cursor, err := MotionCollection().Find(context.TODO(), bson.D{{}})
	defer cursor.Close(context.TODO())
	if err != nil {
		panic(err)
	}
	motions := make([]*Motion, 30)
	err = cursor.All(context.TODO(), &motions)
	if err != nil {
		log.Println("[MongoDB] Read All Motion Err ", err)
		return nil
	}
	return motions
}
