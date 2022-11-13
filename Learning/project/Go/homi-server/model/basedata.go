package model

import (
	"time"
)

// MainData 存入数据库中的数据
type MainData struct {
	Model `bson:",inline"`
	ID    string `bson:"id"` // TODO 生成业务主键?
	//CreatedAt int64  `bson:"createdAt" json:"createdTime"`
	//UpdatedAt int64  `bson:"updatedAt" json:"-"`
	//IsDeleted bool   `bson:"isDeleted" json:"-"`
}

type DynamicData struct {
	MainData
	LastUsedTime time.Time `gorm:"-:migration"` //不会被持久化的字段
}

type StateData struct {
	State     int8   `json:"state" bson:"state"`
	StateTime int64  `json:"stateTime" bson:"stateTime"`
	StateDesc string `json:"stateDesc" bson:"stateDesc"`
}
