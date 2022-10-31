package logic

import (
	"server/models"
	"server/ws"
)

//const (
//	Add      CmdType = 0
//	Delete   CmdType = 1
//	Move     CmdType = 2
//	Withdraw CmdType = 3
//	Adjust   CmdType = 4
//)

var handlers = []ws.CmdHandlerFunType{AddCmd, DeleteCmd, MoveCmd, WithdrawCmd, AdjustCmd}

func init() {
	ws.CmdHandler = CmdHandler
}

func CmdHandler(cmd *models.Cmd) error {
	handler := handlers[cmd.Type] //通过下标访问选择哪一个处理方法
	err := handler(cmd)
	if err != nil {
		return err
	}
	return nil
}

func AddCmd(cmd *models.Cmd) error {
	return nil
}

func DeleteCmd(cmd *models.Cmd) error {
	return nil
}

func MoveCmd(cmd *models.Cmd) error {
	return nil
}

func WithdrawCmd(cmd *models.Cmd) error {
	return nil
}

func AdjustCmd(cmd *models.Cmd) error {
	return nil
}
