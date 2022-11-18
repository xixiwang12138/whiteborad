package models

import (
	"encoding/json"
	"log"
	"server/common/utils"
	"time"
)

type CmdType int8

const (
	Add        CmdType = 0
	Delete     CmdType = 1
	Withdraw   CmdType = 2
	Adjust     CmdType = 3
	SwitchPage CmdType = 4 //演示模式
	SwitchMode CmdType = 5
	LoadPage   CmdType = 6
)

type ElementKV map[string]any

func NewElementKV(seq string) ElementKV {
	var m ElementKV
	err := json.Unmarshal([]byte(seq), &m)
	if err != nil {
		log.Println(err)
		return nil
	}
	return m
}

func (e ElementKV) StringfyFiled() (map[string]any, error) {
	for _, k := range ElementFieldsWhichArray {
		v, ok := e[k]
		if ok {
			points := v.([]any)
			bytes, err := json.Marshal(points)
			if err != nil {
				log.Println(err)
				return nil, err
			}
			e[k] = string(bytes)
		}
	}
	return e, nil
}

func (e ElementKV) GetElementId() string {
	return e["id"].(string)
}

func (e ElementKV) SetElementId(id string) {
	e["id"] = id
}

type RepeatedElement map[string][2]any

func NewRepeatedElement(seq string) RepeatedElement {
	var m RepeatedElement
	err := json.Unmarshal([]byte(seq), &m)
	if err != nil {
		log.Println(err)
		return nil
	}
	return m
}

func (e RepeatedElement) GetBefore() ElementKV {
	res := make(map[string]any)
	for k, v := range e {
		res[k] = v[0]
	}
	return res
}

func (e RepeatedElement) GetAfter() ElementKV {
	res := make(map[string]any)
	for k, v := range e {
		res[k] = v[1]
	}
	return res
}

type StringStringElement map[string]string

func (e StringStringElement) Convert() (ElementKV, error) {
	return utils.MapValueConvert(ElementFiledMap, e)
}

func (e StringStringElement) GetElementId() string {
	return e["id"]
}

func (e StringStringElement) SetElementId(id string) {
	e["id"] = id
}

func (e StringStringElement) UpwardTransformation() map[string]any {
	res := make(map[string]any, len(e))
	for k, v := range e {
		res[k] = v
	}
	return res
}

type Cmd struct {
	ID          string  `json:"id"`          //操作id
	PageId      string  `json:"pageId"`      //操作的页面
	Type        CmdType `json:"type"`        //操作类型
	O           string  `json:"o"`           //操作对象
	Payload     string  `json:"payload"`     //操作后的值
	Time        int64   `json:"time"`        //操作的时间
	BoardId     string  `json:"boardId"`     //所在的白板id
	Creator     string  `json:"creator"`     //操作人id
	ElementType int     `json:"elementType"` //操作的值的类型
}

func NewCmd(t CmdType, payload string, boardId string, creator string) *Cmd {
	return &Cmd{Type: t, Payload: payload, BoardId: boardId, Creator: creator, Time: time.Now().UnixMilli()}
}

func (cmd *Cmd) SetInfo(boardId string, creator string) {
	cmd.BoardId = boardId
	cmd.Creator = creator
}
