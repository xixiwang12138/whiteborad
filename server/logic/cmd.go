package logic

import (
	"github.com/pkg/errors"
	"log"
	"server/common/cache"
	"server/common/cts"
	"server/common/sources"
	"server/common/utils"
	"server/dao"
	"server/models"
	"server/ws"
)

var actuallyHandlers = []func(cmd *models.Cmd) error{AddCmd, DeleteCmd, WithdrawCmd, AdjustCmd, SwitchPageCmd, SwitchMode, LoadPageCmd}

func LoadPageCmd(cmd *models.Cmd) error {
	pageId := cmd.PageId //需要加载pageId的内容
	pageVo, err := Load(cmd.BoardId, pageId)
	if err != nil {
		log.Println(err)
		return err
	}
	err = ws.HubMgr.SendLoadMessage(cmd.BoardId, cmd.Creator, pageVo)
	if err != nil {
		return err
	}
	return nil
}

// SwitchMode 不会接受到的cmd类型
func SwitchMode(cmd *models.Cmd) error {
	return nil
}

func init() {
	ws.CmdHandler = CmdHandler
	ws.StoreHandler = StoreBoard
	ws.LoadingHandler = Load
	ws.UserInfoHandler = dao.UserRepo.FindByID
}

func CmdHandler(o *models.Cmd, boardId string, userId string) error {
	//广播
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf(cts.ErrorFormat, r)
			}
		}()
		if o.Type == models.LoadPage { //load 命令不需要转发
			return
		}
		ws.HubMgr.BroadcastCmd(boardId, o, userId) //注意不给发送者转发
	}()
	//更改数据
	o.SetInfo(boardId, userId)
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
	p := cmd.Payload
	element, err := models.NewElementKV(p).StringfyFiled()
	if err != nil {
		return err
	}
	err = sources.RedisSource.Client.HMSet(cache.ElementKey(cmd.O), element).Err()
	if err != nil {
		return err
	}
	err = sources.RedisSource.Client.SAdd(cache.PageElementsKey(cmd.PageId), cmd.O).Err()
	if err != nil {
		return err
	}
	return nil
}

// DeleteCmd 在页面上删除某一个元素
func DeleteCmd(cmd *models.Cmd) error {
	err := elementOpr.Delete(cmd.PageId, cmd.O)
	if err != nil {
		return err
	}
	return nil
}

func WithdrawCmd(cmd *models.Cmd) error {
	//AddCmd, DeleteCmd, WithdrawCmd, AdjustCmd, SwitchPageCmd, SwitchMode, LoadPageCmd
	//对撤销操作求逆，进行持久化更改
	payloadCmd := utils.Deserialize[models.Cmd](cmd.Payload)
	switch payloadCmd.Type {
	case models.Add:
		err := elementOpr.Delete(payloadCmd.PageId, payloadCmd.O)
		if err != nil {
			return err
		}
		return nil
	case models.Delete:
		err := sources.RedisSource.Client.HMSet(cache.ElementKey(payloadCmd.O), map[string]interface{}{
			"isDeleted": "0",
		}).Err()
		err = sources.RedisSource.Client.SAdd(cache.PageElementsKey(payloadCmd.PageId), payloadCmd.O).Err()
		if err != nil {
			return err
		}
		return nil
	case models.Adjust:
		before, err := models.NewRepeatedElement(payloadCmd.Payload).GetBefore().StringfyFiled()
		err = sources.RedisSource.Client.HMSet(cache.ElementKey(payloadCmd.O), before).Err()
		if err != nil {
			return err
		}
		return nil
	default:
		return errors.New("no-supported withdraw cmd")

	}
}

// AdjustCmd 调整一个对象的某一个属性
func AdjustCmd(cmd *models.Cmd) error {
	p := cmd.Payload
	after, err := models.NewRepeatedElement(p).GetAfter().StringfyFiled()
	if err != nil {
		log.Println(err)
		return err
	}
	err = sources.RedisSource.Client.HMSet(cache.ElementKey(cmd.O), after).Err()
	if err != nil {
		return err
	}
	return nil
}

// SwitchPageCmd 切换页面
func SwitchPageCmd(cmd *models.Cmd) error {
	//judge cmd creator is owner or not
	//judge mode is readonly???
	return nil
}

var elementOpr = &ElementOperator{}

type ElementOperator struct{}

func (opr *ElementOperator) Delete(pageId string, elementId string) error {
	//err := sources.RedisSource.Client.SRem(cache.PageElementsKey(pageId), elementId).Err()
	//if err != nil {
	//	return err
	//}
	err := sources.RedisSource.Client.HMSet(cache.ElementKey(elementId), map[string]interface{}{
		"isDeleted": "1",
	}).Err()
	if err != nil {
		return err
	}
	return nil
}
