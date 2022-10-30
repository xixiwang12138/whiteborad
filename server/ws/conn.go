package ws

import (
	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
	"log"
	"net"
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

// ListenJSONMessage 监听连接消息JSON格式
func (this *BaseConnection) ListenJSONMessage(handler func(*interface{}) error) {
	defer func() {
		err := this.Close()
		if err != nil {
			log.Printf("[BaseConnection.ListenMessage]:websocket conn failed when closing, %s", err) // 这里打印就ok
		}
	}()
	for !this.isClosed {
		o := new(interface{})
		err := this.WsConn.ReadJSON(o)
		if err == nil {
			err = handler(o)
		}
		if err != nil {
			if websocket.IsUnexpectedCloseError(err) || errors.Is(err, net.ErrClosed) {
				this.isClosed = true
			} else {
				go this.onError(err)
			}
		}
	}
}

func (this *BaseConnection) SendMessage(message []byte) error {
	err := this.WsConn.WriteMessage(websocket.TextMessage, message)
	if err != nil {
		return err
	}
	return nil
}

func (this *BaseConnection) SendJSON(obj any) error {
	err := this.WsConn.WriteJSON(obj)
	if err != nil {
		return err
	}
	return nil
}
