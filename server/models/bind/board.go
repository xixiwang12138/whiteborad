package bind

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
