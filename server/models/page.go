package models

import (
	"encoding/json"
	"log"
	"server/common/utils"
	"sync"
)

type BoardType int8

const (
	ReadOnly BoardType = 0
	Editable BoardType = 1
)

type Model struct {
	CreatTime  int64 `json:"creatTime"`  //创建时间
	DeleteTime int64 `json:"deleteTime"` //删除时间
}

//默认情况下，GORM 会使用 ID 作为表的主键

type WhiteBoard struct {
	ID      int64     `json:"id"`      //使用雪花算法
	Mode    BoardType `json:"mode"`    //模式
	Creator int64     `json:"creator"` //创建者
	Model
}

const (
	DefaultPageName = "default"
)

type Page struct {
	ID           int64  `json:"id"`                                      //页标识
	WhiteBoardID int64  `json:"whiteBoardId" gorm:"column:whiteBoardId"` //所属白板的id
	DisplayName  string `json:"displayName"`                             //展示的名字
	Content      string `json:"content" gorm:"type:LONGTEXT"`            //存储的一页上的所有图形对象,存储pageStringContent序列化后的字符串
}

type pageContent struct {
	Data []ElementKV `json:"data"` //反序列化后Data为map类型
}

type pageStringContent struct {
	Data []string `json:"data"`
}

func DataToStringFiled(d []string) string {
	data := &pageStringContent{Data: d}
	return utils.Serialize(data)
}

func (p *Page) BuildVo() (*PageVO, error) {
	res := &PageVO{
		Page:     p,
		Elements: nil,
	}

	model := &pageStringContent{}
	err := json.Unmarshal([]byte(p.Content), model)
	if err != nil {
		return nil, err
	}

	//for each element, element is JSON string
	length := len(model.Data)
	result := make([]ElementKV, length)
	var wg sync.WaitGroup
	wg.Add(length)
	for i, eString := range model.Data {
		eString := eString
		i := i
		go func() {
			defer wg.Done()
			stringStringMap := make(map[string]string)
			err = json.Unmarshal([]byte(eString), &stringStringMap)
			if err != nil {
				log.Println(err)
				return
			}
			newValue, err := utils.MapValueConvert(ElementFiledMap, stringStringMap)
			if err != nil {
				log.Println(err)
				return
			}
			result[i] = newValue
		}()
	}
	wg.Wait()

	res.Elements = result
	return res, nil
}

type PageVO struct {
	*Page
	Elements []ElementKV `json:"elements"`
}

type GraphType int8

const (
	StraightLine GraphType = 0 //直线
	Rectangle    GraphType = 1 //矩形
	Oval         GraphType = 2 //椭圆
	Free         GraphType = 3 //自由曲线
	Text         GraphType = 4 //文本
)

type BaseGraph struct {
}

type Graph struct {
	ID         int64     `json:"id"`
	PageId     int64     `json:"pageId"`  //所属页面的id
	Creator    int64     `json:"creator"` //创建者id
	CreateTime int64     `json:"createTime"`
	Type       GraphType `json:"type"`
	Content    []byte    `json:"content"`
	Deleted    bool      `json:"deleted"` //是否擦除
	//TODO undo redo
}
