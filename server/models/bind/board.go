package bind

import "server/models"

type BoardReq struct {
	BoardId   string `json:"boardId"`
	BoardName string `json:"boardName"`
}

type PageReq struct {
	BoardId string `json:"boardId"`
	PageId  string `json:"pageId"`
}

type NameReq struct {
	Name string `json:"name"`
}

type BoardMode struct {
	BoardId string           `json:"boardId"`
	Mode    models.BoardType `json:"mode"` //控制是否可编辑
}

type NewPageReq struct {
	BoardId string `json:"boardId"`
	Name    string `json:"name"`
	Data    string `json:"pageData"`
}
