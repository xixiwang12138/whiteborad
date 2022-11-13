package static

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"homi-server-single/models/opr"
	"log"
)

type WhiteNoise struct {
	ID_          string `json:"_id" bson:"_id,omitempty"`
	WhiteNoiseID int    `json:"id" bson:"id"`
	DisplayName  string `json:"displayName" bson:"displayName"`
	Title        string `json:"title" bson:"title"`
	Epname       string `json:"epname" bson:"epname"`
	Singer       string `json:"singer" bson:"singer"`
	Src          string `json:"src" bson:"src"`
	Type         int8   `json:"type" bson:"type"`
}

func WhiteNoiseCollection() *mongo.Collection {
	return opr.MongoOpr.Collection("WhiteNoise")
}

func WhiteNoises() []*WhiteNoise {
	cursor, err := WhiteNoiseCollection().Find(context.TODO(), bson.D{{}})
	defer cursor.Close(context.Background())
	if err != nil {
		panic(err)
	}
	whiteNoises := make([]*WhiteNoise, 30)
	err = cursor.All(context.TODO(), &whiteNoises)
	if err != nil {
		log.Println("[MongoDB] Read All WhiteNoise Err ", err)
		return nil
	}
	return whiteNoises
}
