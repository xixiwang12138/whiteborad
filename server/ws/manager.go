package ws

import (
	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
	"log"
	"net"
	"server/common/utils"
	"server/models"
	"strconv"
	"strings"
)

type CmdHandlerFunType func(cmd *models.Cmd, boardId int64, userId int64) error

var CmdHandler CmdHandlerFunType
var StoreHandler func(int64)

//每一个白板为Hub

func ConnectHandler(conn *websocket.Conn, processPath string) {
	defer func() {
		if r := recover(); r != nil {
			log.Println(r)
		}
	}()
	//提取路径参数，读取所在白板以及连接的用户
	res := strings.Split(processPath, "/")
	boardIdStr, userIdStr := res[1], res[2]
	userId, _ := strconv.ParseInt(userIdStr, 10, 64)
	boardId, _ := strconv.ParseInt(boardIdStr, 10, 64)

	log.Println("user: ", userIdStr, "=========> "+"enter board: ", boardIdStr)
	//处理用户进入某个白板
	HubMgr.EnterHub(boardId, userId, conn)

	//监听消息
	userConn := HubMgr.GetHub(boardId).GetUserConnection(userId)
	userConn.ListenJSONMessage(CmdHandler)
}

// region HubManager部分

var HubMgr = &HubManager{Hubs: utils.NewConcurrentMap[int64, *Hub]()}

type HubManager struct {
	Hubs *utils.ConcurrentMap[int64, *Hub]
}

func (h *HubManager) GetHub(boardId int64) *Hub {
	r, ok := h.Hubs.Get(boardId)
	if !ok {
		return nil
	}
	return r
}

func (h *HubManager) HubCreated(boardId int64) bool {
	return h.Hubs.Has(boardId)
}

func (h *HubManager) CreateHub(boardId int64) {
	h.Hubs.Set(boardId, NewHub(boardId))
}

func (h *HubManager) DeleteHub(boardId int64) {
	h.Hubs.Delete(boardId)
}

func (h *HubManager) EnterHub(boardId int64, userId int64, conn *websocket.Conn) {
	//判断hub白板是否创建
	if !h.HubCreated(boardId) {
		h.CreateHub(boardId)
	}
	//获取hub
	hub := h.GetHub(boardId)
	//添加连接
	userConnection := NewUserConnection(NewBaseConnection(conn), userId, boardId)
	hub.AddUser(userConnection)

	//TODO 通知前端更新在线用户
	hub.Broadcast(nil)
}

func (h *HubManager) LeaveHub(boardId int64, userId int64) {
	//获取hub
	hub := h.GetHub(boardId)
	userConnection := hub.GetUserConnection(userId)
	if userConnection == nil {
		return
	}
	//在Hub中删除该用户
	hub.DeleteUser(userId)
	//如果Hub中没有人
	if hub.IsEmpty() {
		// delete this hub(Board)
		h.DeleteHub(boardId)

		//store
		StoreHandler(boardId)
	}
}

func (h *HubManager) BroadcastCmd(boardId int64, cmd *models.Cmd, exceptUser ...int64) {
	//获取hub
	hub := h.GetHub(boardId)
	hub.Broadcast(cmd, exceptUser...)
}

//endregion

//region Hub部分

type Hub struct {
	BoardId     int64                                        //白板id
	Connections *utils.ConcurrentMap[int64, *UserConnection] //当前白板下所有的连接
}

func NewHub(boardId int64) *Hub {
	return &Hub{BoardId: boardId, Connections: utils.NewConcurrentMap[int64, *UserConnection]()}
}

// Broadcast 给Hub中每一个用户发送消息，在排除列表中的除外
func (hub *Hub) Broadcast(obj any, exceptUsers ...int64) {
	//迭代每一个连接，发送消息
	hub.Connections.Data().Range(func(key, value any) bool {
		userId := key.(int64)
		_, ok := utils.FindBasic(exceptUsers, userId)
		if ok { //如果在排除名单中，直接跳过
			return true
		}
		conn := value.(*UserConnection)
		err := conn.SendJSON(obj) //TODO 差错控制
		if err != nil {
			log.Println("[Error] Send To ===============> ", userId, err)
			return true
		}
		return true
	})
}

func (hub *Hub) GetUserConnection(userId int64) *UserConnection {
	h, ok := hub.Connections.Get(userId)
	if !ok {
		return nil
	}
	return h
}

func (hub *Hub) AddUser(c *UserConnection) {
	hub.Connections.Set(c.UserId, c)
}

func (hub *Hub) DeleteUser(userId int64) {
	hub.Connections.Delete(userId)
}

func (hub *Hub) IsEmpty() bool {
	return hub.Connections.Empty()
}

//endregion

//region 用户连接部分

type UserConnection struct {
	*BaseConnection
	UserId  int64
	BoardId int64 //所属的白板id
}

func NewUserConnection(baseConnection *BaseConnection, userId int64, boardId int64) *UserConnection {
	res := &UserConnection{BaseConnection: baseConnection, UserId: userId, BoardId: boardId}
	res.BaseConnection.WsConn.SetCloseHandler(func(code int, text string) error {
		log.Println(code, text, "===========> websocket close")
		res.CloseHandler()
		return nil
	})
	return res
}

func (c *UserConnection) CloseHandler() {
	HubMgr.LeaveHub(c.BoardId, c.UserId)
	//TODO 离开白板的时候是否需要持久化？？？
}

func (c *UserConnection) ListenJSONMessage(handler func(o *models.Cmd, boardId int64, userId int64) error) {
	defer func() {
		err := c.Close()
		if err != nil {
			log.Printf("[BaseConnection.ListenMessage]:websocket conn failed when closing, %s", err)
		}
	}()
	for !c.isClosed {
		o := new(models.Cmd)
		err := c.WsConn.ReadJSON(o)
		if err == nil {
			err := handler(o, c.BoardId, c.UserId)
			if err != nil {
				//TODO 日志
				return
			}
		}
		if err != nil {
			if websocket.IsUnexpectedCloseError(err) || errors.Is(err, net.ErrClosed) {
				c.isClosed = true
			} else {
				go c.onError(err)
			}
		}
	}
}

//endregion
