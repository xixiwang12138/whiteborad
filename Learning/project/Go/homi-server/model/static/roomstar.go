package static

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"homi-server-single/common/data"
	"homi-server-single/models/opr"
	"log"
)

type RoomStar struct {
	ID_         string            `json:"_id" bson:"_id,omitempty"`
	RoomStarID  int               `json:"id" bson:"id"`
	DisplayName string            `json:"displayName" bson:"displayName"`
	Description string            `json:"description" bson:"description"`
	MaxDuration int               `json:"maxDuration"`
	Conditions  []*data.Condition `json:"conditions" bson:"conditions"`
	Stage       int               `json:"stage" bson:"stage"`
}

func RoomStarCollection() *mongo.Collection {
	return opr.MongoOpr.Collection("RoomStar")
}

func RoomStars() []*RoomStar {
	cursor, err := RoomStarCollection().Find(context.TODO(), bson.D{{}})
	defer cursor.Close(context.Background())
	if err != nil {
		panic(err)
	}
	roomStars := make([]*RoomStar, 30)
	err = cursor.All(context.TODO(), &roomStars)
	if err != nil {
		log.Println("[MongoDB] Read All RoomStars Err ", err)
		return nil
	}
	return roomStars
}
