package logic

import (
	"server/common/cache"
	"server/common/sources"
	"server/models"
	"server/ws"
)

var actuallyHandlers = []func(cmd *models.Cmd) error{AddCmd, DeleteCmd, MoveCmd, WithdrawCmd, AdjustCmd}

func init() {
	ws.CmdHandler = CmdHandler
}

func CmdHandler(o *models.Cmd, boardId int64, userId int64) error {
	//广播
	if o.Type != models.Withdraw {
		ws.HubMgr.BroadcastCmd(boardId, o, userId) //注意不给发送者转发
	}
	o.Fill(boardId, userId)
	//更改数据
	handler := actuallyHandlers[o.Type] //通过下标访问选择哪一个处理方法
	err := handler(o)
	if err != nil {
		return err
	}
	return nil
}

// AddCmd 在页面上增加某一个元素
func AddCmd(cmd *models.Cmd) error {
	//存储元素对象
	err := sources.RedisSource.Client.HMSet(cache.ElementKey(cmd.O), cmd.V).Err()
	if err != nil {
		return err
	}
	//存储一个页面上所有的元素id
	err = sources.RedisSource.Client.SAdd(cache.PageElementsKey(cmd.PageId), cmd.O).Err()
	if err != nil {
		return err
	}
	return nil
}

// DeleteCmd 在页面上删除某一个元素
func DeleteCmd(cmd *models.Cmd) error {
	err := sources.RedisSource.Del(cache.ElementKey(cmd.O))
	if err != nil {
		return err
	}
	err = sources.RedisSource.Client.SRem(cache.PageElementsKey(cmd.PageId), cmd.O).Err()
	if err != nil {
		return err
	}
	return nil
}

// MoveCmd 页面上移动一个元素
func MoveCmd(cmd *models.Cmd) error {
	err := sources.RedisSource.Client.HMSet(cache.ElementKey(cmd.O), cmd.V).Err()
	if err != nil {
		return err
	}
	return nil
}

func WithdrawCmd(cmd *models.Cmd) error { //TODO
	//求逆操作
	//广播给其他的用户
	return nil
}

// AdjustCmd 调整一个对象的某一个属性
func AdjustCmd(cmd *models.Cmd) error {
	err := sources.RedisSource.HSet(cache.ElementKey(cmd.O), cmd.P, cmd.V)
	if err != nil {
		return err
	}
	return nil
}
