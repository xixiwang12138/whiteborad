package model

import (
	"time"
)

const (
	RewardCodeStateNormal = 0
	RewardCodeStateUsed   = 1
	RewardCodeStateClosed = 2
)

type RewardCode struct {
	Model       `json:",inline" bson:",inline"`
	Code        string `json:"code" bson:"code"`
	Description string `json:"description" bson:"description"`
	StartTime   int64  `json:"startTime" bson:"startTime"`
	EndTime     int64  `json:"endTime" bson:"endTime"`
	UseTime     int64  `json:"useTime" bson:"useTime"`

	State int8 `json:"state" bson:"state"`

	Receiver string `json:"receiver"` //领取人
}

//func (rc RewardCode) GetID() string {
//	return rc.ID
//}
//func (rc RewardCode) GetCollection() *mongo.Collection {
//	return opr.MongoOpr.Collection("RewardCode")
//}
//
//func (rc RewardCode) Save() error {
//	err := myMongo.Save(rc)
//	if err != nil {
//		return err
//	}
//	return nil
//}

// 使用兑换码
func (this *RewardCode) Use(openid string) {
	this.Receiver = openid
	this.UseTime = time.Now().UnixMilli()
	this.State = RewardCodeStateUsed
}

//// ConditionGetRewardCode When querying with struct, GORM will only query with non-zero fields, that means if your field’s value is 0, '', false or other zero values, it won’t be used to build query conditions
//// 按照结构体的时候会忽略零值的查询条件————也就意味着最好在构建枚举的时候将默认值最好设定为零值
//func ConditionGetRewardCode(rewardCode *RewardCode) (*RewardCode, error) {
//	dest := &RewardCode{}
//	err := DbOpr.Model(rewardCode).Where(rewardCode).First(dest).Error
//	if err != nil {
//		return nil, err
//	}
//	return dest, nil
//}
