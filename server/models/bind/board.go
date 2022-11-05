package bind

type BoardReq struct {
	BoardId   int64  `json:"boardId"`
	BoardName string `json:"boardName"`
}

type PageReq struct {
	PageId int64 `json:"pageId"`
}
