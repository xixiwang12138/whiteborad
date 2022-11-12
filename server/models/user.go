package models

import "server/common/utils"

var as = []string{"#3E6182", "#956AA4", "#A46A6A"}
var names = []string{"scut", "七牛", "勇敢牛牛"}

type User struct {
	Model
	Name     string `json:"name"`
	Avatar   string `json:"avatar"`
	Phone    string `json:"-"`
	Password string `json:"-"`
}

func NewUser(phone string, password string) *User {
	id := utils.GenerateId()
	return &User{
		Model:    Model{ID: id},
		Phone:    phone,
		Password: password,
		Avatar:   utils.RandomPick(as),
		Name:     utils.RandomPick(names) + "_" + utils.RandomString(2),
	}
}