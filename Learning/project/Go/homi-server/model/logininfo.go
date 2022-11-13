package model

import model "homi-server-single/models/playerdata"

// LoginState 实现枚举效果
type LoginState int8

const (
	Normal   LoginState = 0
	Abnormal LoginState = 1
)

type LoginInfo struct {
	model.PlayerData `json:",inline" bson:",inline"`
	LoginTime        int64      `json:"loginTime" bson:"loginTime"`
	LogoutTime       int64      `json:"logoutTime" bson:"logoutTime"`
	State            LoginState `json:"state" bson:"state"`
}

//func (l LoginInfo) GetID() string {
//	return l.ID
//}
//
//func (l LoginInfo) GetCollection() *mongo.Collection {
//	return oprs.MongoOpr.Collection("LoginInfo")
//}
//
//func (l LoginInfo) Save() error {
//	fmt.Println(l.GetCollection())
//	err := myMongo.Save(l)
//	if err != nil {
//		return err
//	}
//	return nil
//}
