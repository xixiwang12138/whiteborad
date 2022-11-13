package playerdata

type IPlayerData interface {
	model.IModel
	GetOpenId() string
}

type PlayerData struct {
	model.MainData `bson:",inline" json:",inline"`
	Openid         string `json:"openid" bson:"openid"`
}

func (self PlayerData) GetOpenId() string {
	return self.Openid
}
