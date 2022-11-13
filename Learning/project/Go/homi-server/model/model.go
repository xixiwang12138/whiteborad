package model

type IModel interface {
	GetMongoId() string
	GetBusinessId() string
}

type Model struct {
	ID string `json:"_id" bson:"_id,omitempty"`
}

func (self Model) GetMongoId() string {
	return self.ID
}

func (self Model) GetBusinessId() string {
	return "" // TODO 生成业务id（雪花？
}
