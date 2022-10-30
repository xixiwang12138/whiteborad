package ws

import (
	"github.com/gorilla/websocket"
	"log"
	"net"
	"net/http"
	"server/common/config"
	"server/common/utils"
)

type OnConnectHandler func(conn *websocket.Conn, processPath string)

var wsServer = &WstServer{}

func StartUp(config *config.WebSocketConfig) {
	ConfigWsServer(config)
	wsServer.Start()
}

type WstServer struct {
	listener net.Listener
	addr     string
	upgrade  *websocket.Upgrader
	path     string //ws处理的路径，这一个是没用的
	//Connections map[string]map[string]*RoomConnection2 //第一个键为roomIndex，第二个键为openid
	onConnectHandlers []OnConnectHandler
}

func ConfigWsServer(config *config.WebSocketConfig) {
	wsServer.addr = config.PORT
	//ws.Connections = make(map[string]map[string]*RoomConnection2, 0)
	wsServer.upgrade = &websocket.Upgrader{
		ReadBufferSize:  4096,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			////TODO 检查ws接受源
			//if r.Method != "GET" {
			//	fmt.Println("method is not GET")
			//	return false
			//}
			////if r.URL.Path != "/123456/2/3" {
			////	fmt.Println("path error")
			////	return false
			////}
			return true
		},
	}
}

func (thisServer *WstServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	thisServer.path = r.RequestURI
	conn, err := thisServer.upgrade.Upgrade(w, r, nil)
	if err != nil {
		log.Println("[ws upgrade]", err)
		return
	}
	log.Println("[ws client connect]", conn.RemoteAddr())
	thisServer.onConnect(conn, r.URL.Path) //每个连接开启协程进行处理
}

func (thisServer *WstServer) Start() (err error) {
	if utils.ExistFile(config.KeyFile) && utils.ExistFile(config.CertFile) {
		log.Println("[WS-Server] listening at ", thisServer.addr+"\n")
		err = http.ListenAndServeTLS(thisServer.addr, config.CertFile, config.KeyFile, thisServer)
		if err != nil {
			log.Println("http serve error:", err)
			return
		}
	} else {
		log.Println("[WS-Server] listening at ", thisServer.addr+"\n")
		log.Println("[WS-Server] CERT FILE NOT EXIST, 已使用WS代替")
		thisServer.listener, err = net.Listen("tcp", thisServer.addr)
		if err != nil {
			log.Println("net listen error:", err)
			return
		}
		err = http.Serve(thisServer.listener, thisServer)
		if err != nil {
			log.Println("http serve error:", err)
			return
		}
	}
	return nil
}

func (thisServer *WstServer) AddOnConnectListener(handler OnConnectHandler) {
	thisServer.onConnectHandlers = append(thisServer.onConnectHandlers, handler)
}

func (thisServer *WstServer) onConnect(conn *websocket.Conn, processPath string) {
	for _, handler := range thisServer.onConnectHandlers {
		go handler(conn, processPath)
	}
}
