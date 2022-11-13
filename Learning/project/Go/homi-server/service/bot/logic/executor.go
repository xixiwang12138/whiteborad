package bots

import (
	"homi-server/service/bot/ws"
	"homi-server/service/player/model"
)

//region 单个机器人行为

type BotState int8

const (
	Waiting  BotState = 0 //待安排
	InRoom   BotState = 1 //正在房间中但是尚未开始专注
	Focusing BotState = 2 //正在专注中（运行态）
)

type StatedBot struct {
	*ws.Client //进入房间后的ws客户端
	BotInfo    *model.Player
	State      BotState
}

// NewStatedBot 创建一个机器人（带有状态），但是尚未连接任何房间
func NewStatedBot(player *model.Player) *StatedBot {
	return &StatedBot{BotInfo: player, State: Waiting}
}

func (bot *StatedBot) IsFocusing() bool {
	return bot.State == Focusing
}

func (bot *StatedBot) EnterRoom(roomId string) {
	bot.Client = ws.NewClient(bot.BotInfo.Openid, roomId)
	bot.State = InRoom

	//绑定连接关闭的处理方法
	bot.Client.Conn.SetCloseHandler(func(code int, text string) error {
		//TODO 日志打印
		if bot.IsFocusing() {
			err := bot.EndFocus()
			if err != nil {
				return err
			}
		}
		bot.LeaveCurrentRoom()
		return nil
	})
}

func (bot *StatedBot) LeaveCurrentRoom() {
	bot.Client.Conn = nil
	bot.State = Waiting
	bot.RoomId = ""
}

func (bot *StatedBot) StartFocus() error {
	if bot.Client == nil {
		panic("请先建立连接")
	}
	err := bot.Client.StartFocus()
	if err != nil {
		return err
	}
	bot.State = Focusing
	return nil
}

func (bot *StatedBot) EndFocus() error {
	if bot.Client == nil {
		panic("请先建立连接")
	}
	bot.State = InRoom
	err := bot.Client.EndFocus()
	if err != nil {
		return err
	}
	return nil
}

//endregion
