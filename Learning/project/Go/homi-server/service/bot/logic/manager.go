package bots

import (
	"homi-server/common/utils"
	roomModel "homi-server/service/room/model/room"
	"log"
	"sync"
)

//region 池化机器人和房间

var botPool BotPool

type BotPool struct {
	Bots  sync.Map          //机器人列表
	Rooms []*roomModel.Room //到访的房间

	//Waiting状态的机器人列表（线程安全）
	WaitingSet utils.Set[string]
}

func InitPool() {
	botPool := BotPool{}

	//加载所有机器人的状态为Waiting
	bots := LoadRobots()
	for _, v := range bots {
		botPool.Bots.Store(v.Openid, v)
		botPool.WaitingSet.Add(v.Openid)
	}

	//加载所有的房间
}

// PollBot 获取一个在Waiting状态的机器人
func (pool *BotPool) PollBot() *StatedBot {
	openid := pool.PollBotOpenid()
	v, ok := pool.Bots.Load(openid)
	res := v.(*StatedBot)
	if !ok {
		return nil
	}
	return res
}

// PollBotOpenid 获取一个在Waiting状态的机器人openid
func (pool *BotPool) PollBotOpenid() string {
	bot, flag := pool.WaitingSet.Poll()
	if flag == false {
		//为空
		panic("没有可用的bot")
	}
	return bot
}

// SelectRoom 选择一个优先级最高的room
func (pool *BotPool) SelectRoom() string {
	return ""
}

//endregion

// region 池化任务

type CmdType int8

func (c CmdType) TypeContent() string {
	switch c {
	case login:
		return "DailyTask"
	case logout:
		return "Logout"
	case enterRoom:
		return "EnterRoomTask"
	case leaveRoom:
		return "LeaveRoom"
	case startFocus:
		return "StartFocus"
	case endFocus:
		return "EndFocus"
	}
	return ""
}

const (
	login CmdType = iota
	enterRoom
	startFocus
	endFocus
	leaveRoom
	logout
)

//TaskState

type Task struct {
	Id          string
	ExecuteTime int64
	CmdType     CmdType
	Done        bool
	Err         error

	Executor *StatedBot //执行者
	PairId   string     //任务配对的对应的id，注意在任务安排的时候，补充该字段
}

func NewTask(executeTime int64, cmdType CmdType, executor *StatedBot) *Task {
	return &Task{ExecuteTime: executeTime, CmdType: cmdType, Executor: executor, Id: utils.RandomString(8)}
}

// taskHandle 任务执行的修饰器，用于日志打印，错误处理
func (task *Task) taskHandle(do func()) func() {
	handler := func() {
		log.Println("[Bot Task]", task.CmdType.TypeContent(), "Executing....")
		do()
		task.Done = true
	}
	return handler
}

var executingPool TaskExecutingPool

type TaskExecutingPool struct { //存储已经成功安排的任务，等待时间到来执行
	Actions sync.Map // <K, V> => <id_string, *Task>
}

func (timeLine *TaskExecutingPool) RegisterTask(tasks ...*Task) {
	for _, task := range tasks {
		switch task.CmdType {
		case login:
			utils.SetAsynchronousTask(task.ExecuteTime, task.taskHandle(func() {

			}))
		case logout:
		case enterRoom:
			utils.SetAsynchronousTask(task.ExecuteTime, task.taskHandle(func() {
				//timeLine.EnterRoomTask(timeLine.RoomId)
			}))
		case leaveRoom:
			utils.SetAsynchronousTask(task.ExecuteTime, task.taskHandle(func() {
				//timeLine.LeaveCurrentRoom()
			}))
		case startFocus:
			utils.SetAsynchronousTask(task.ExecuteTime, task.taskHandle(func() {
				//timeLine.StartFocus()
			}))
		case endFocus:
			utils.SetAsynchronousTask(task.ExecuteTime, task.taskHandle(func() {
				//timeLine.EndFocus()
			}))
		}
		timeLine.Actions.Store(task.Id, task)
	}
}

func (timeLine *TaskExecutingPool) RegisterTaskPair(task1, task2 *Task) {
	task1.PairId = task2.Id
	task2.PairId = task1.Id
	timeLine.RegisterTask(task1, task2)
}

//endregion
