package models

type UserJoin struct {
	ID            string `json:"id"`
	UserId        string `json:"userId"`
	BoardId       string `json:"boardId"`
	LastEnterTime int64  `json:"lastEnterTime"`
}
