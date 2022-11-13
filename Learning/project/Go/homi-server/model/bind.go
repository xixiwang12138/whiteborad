package model

import (
	"homi-server-single/models/playerdata"
	"homi-server-single/models/room"
)

type LoginForm struct {
	Openid      string      `form:"openid" binding:"required"`
	WxUserInfo  *WxUserInfo `form:"info"`
	InviterCode string      `form:"inviterCode"`
}

type WxUserInfo struct {
	NickName  string `json:"nickName"`
	AvatarUrl string `json:"avatarUrl"`
}

type LoginResponse struct {
	Player *playerdata.Player `json:"player"`
	Token  string             `json:"token"`
	Extra  interface{}        `json:"extra"`
	Data   struct {
		PlayerRoom *room.Room             `json:"playerRoom"`
		PlayerTask *playerdata.PlayerTask `json:"playerTask"`
	} `json:"data"`
}
