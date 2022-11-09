package ws

import (
	"github.com/gorilla/websocket"
	"log"
	"server/common/cts"
)

type OnErrorHandler func(error)

type BaseConnection struct {
	WsConn   *websocket.Conn
	isClosed bool
	onError  OnErrorHandler
	onClose  func() error // 在关闭的时候有传递消息的需求拓展参数
}

func NewBaseConnection(wsConn *websocket.Conn) *BaseConnection {
	res := &BaseConnection{
		WsConn:  wsConn,
		onClose: func() error { return nil },
	}
	res.onError = func(err error) {
		log.Printf(cts.ErrorFormat, err)
	}
	return res
}

func (this *BaseConnection) Close() error {
	if !this.isClosed {
		err := this.WsConn.Close()
		if err != nil {
			return err
		}
	}
	return nil
}

func (this *BaseConnection) SetOnErrorHandler(handler OnErrorHandler) {
	this.onError = handler
}

func (this *BaseConnection) SendJSON(obj any) error {
	err := this.WsConn.WriteJSON(obj)
	if err != nil {
		return err
	}
	return nil
}
