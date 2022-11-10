package models

type CmdType int8

const (
	Add        CmdType = 0
	Delete     CmdType = 1
	Withdraw   CmdType = 2
	Adjust     CmdType = 3
	SwitchPage CmdType = 4
)

type ElementKV map[string]any
type ReceiveCmdElement map[string][2]any

func (e ElementKV) GetElementId() string {
	return e["id"].(string)
}

func (e ReceiveCmdElement) GetAfter() map[string]any {
	res := make(map[string]any)
	for k, v := range e {
		res[k] = v[1]
	}
	return res
}

type Cmd struct {
	ID          string  `json:"id"`          //操作id
	PageId      string  `json:"pageId"`      //操作的页面
	Type        CmdType `json:"type"`        //操作类型
	O           string  `json:"o"`           //操作对象
	Payload     string  `json:"payload"`     //操作后的值
	Time        int64   `json:"time"`        //操作的时间
	BoardId     string  `json:"boardId"`     //所在的白板id
	Creator     string  `json:"creator"`     //操作人id
	ElementType int     `json:"elementType"` //操作的值的类型
}

func (cmd *Cmd) Fill(boardId string, creator string) {
	cmd.BoardId = boardId
	cmd.Creator = creator
}
