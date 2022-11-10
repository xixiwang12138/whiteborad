package bind

type BoardReq struct {
	BoardId   int64  `json:"boardId"`
	BoardName string `json:"boardName"`
}

type PageReq struct {
	BoardId int64 `json:"boardId"`
	PageId  int64 `json:"pageId"`
}
