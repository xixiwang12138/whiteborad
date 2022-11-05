package models

type UserJoin struct {
	ID            int64 `json:"id" gorm:"autoIncrement"`
	UserId        int64 `json:"userId"`
	BoardId       int64 `json:"boardId"`
	LastEnterTime int64 `json:"lastEnterTime"`
}
