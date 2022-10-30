package models

type CmdType int8

const (
	Add      CmdType = 0
	Delete   CmdType = 1
	Move     CmdType = 2
	Withdraw CmdType = 3
	Adjust   CmdType = 4
)

type Cmd struct {
	ID     int64   `json:"id"`     //操作id
	Type   CmdType `json:"type"`   //操作类型
	O      int64   `json:"o"`      //操作对象
	P      string  `json:"p"`      //操作属性
	V      any     `json:"v"`      //操作后的值
	Before any     `json:"before"` //操作前的值
	Time   int64   `json:"time"`   //操作的时间
}
