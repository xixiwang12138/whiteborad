package ws

import (
	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
	"log"
	"net"
	"server/common/cts"
)

type OnMessageListener func([]byte) error
type OnErrorHandler func(error)

type BaseConnection struct {
	WsConn    *websocket.Conn
	isClosed  bool
	onMessage OnMessageListener
	onError   OnErrorHandler
	onClose   func() error // 在关闭的时候有传递消息的需求拓展参数
}

func NewBaseConnection(wsConn *websocket.Conn) *BaseConnection {
	res := &BaseConnection{
		WsConn:    wsConn,
		onMessage: func(bytes []byte) error { return nil },
		onClose:   func() error { return nil },
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

func (this *BaseConnection) SetOnMessageListener(listener OnMessageListener) {
	this.onMessage = listener
}

func (this *BaseConnection) SetOnErrorHandler(handler OnErrorHandler) {
	this.onError = handler
}

func (this *BaseConnection) SetOnCloseHandler(handler func() error) {
	this.WsConn.SetCloseHandler(func(_ int, _ string) error {
		this.isClosed = true
		return handler()
	})
}

// ListenMessage 监听连接消息，必须在协程中调用
func (this *BaseConnection) ListenMessage() {
	defer func() {
		err := this.Close()
		if err != nil {
			log.Printf("[BaseConnection.ListenMessage]:websocket conn failed when closing, %s", err) // 这里打印就ok
		}
	}()
	for !this.isClosed {
		_, buf, err := this.WsConn.ReadMessage()
		if err == nil {
			err = this.onMessage(buf)
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