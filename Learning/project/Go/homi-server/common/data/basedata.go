package data

import (
	"time"
)

type BaseData struct {
}

// MainData 存入数据库中的数据
type MainData struct {
	BaseData
	DBDataModel // https://gorm.io/zh_CN/docs/models.html  包括字段 ID、CreatedAt、UpdatedAt、DeletedAt
}

type DynamicData struct {
	MainData
	lastUsedTime time.Time `gorm:"-:migration"` //不会被持久化的字段
}

type DBDataModel struct {
	ID        int64 `gorm:"index"`
	CreatedAt int64 `gorm:"autoUpdateTime:milli"`
	UpdatedAt int64 `gorm:"autoCreateTime:milli"`
	IsDeleted bool  `gorm:"index"`
}
