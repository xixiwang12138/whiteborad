package models

type CmdType int8

const (
	Add      CmdType = 0
	Delete   CmdType = 1
	Move     CmdType = 2
	Withdraw CmdType = 3
	Adjust   CmdType = 4
)

type ElementKV map[string]any

func (e ElementKV) GetElementId() int64 {
	return e["id"].(int64)

}

type Cmd struct {
	ID      int64     `json:"id"`      //操作id
	PageId  int64     `json:"pageId"`  //操作的页面
	Type    CmdType   `json:"type"`    //操作类型
	O       int64     `json:"o"`       //操作对象
	P       string    `json:"p"`       //操作属性
	V       ElementKV `json:"v"`       //操作后的值
	Before  ElementKV `json:"before"`  //操作前的值
	Time    int64     `json:"time"`    //操作的时间
	BoardId int64     `json:"boardId"` //所在的白板id
	Creator int64     `json:"creator"` //操作人id
}

func (cmd *Cmd) Fill(boardId int64, creator int64) {
	cmd.BoardId = boardId
	cmd.Creator = creator
}
