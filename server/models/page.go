package models

import (
	"encoding/json"
	"log"
	"server/common/utils"
	"sync"
)

type BoardType int8

const (
	Editable BoardType = 0
	ReadOnly BoardType = 1
)

type Model struct {
	ID         string `json:"id"`                                     //主键
	CreatTime  int64  `json:"creatTime" gorm:"autoCreateTime:milli"`  //创建时间
	UpdateTime int64  `json:"updateTime" gorm:"autoUpdateTime:milli"` //最后一次更新时间
	DeleteTime int64  `json:"deleteTime"`                             //删除时间
}

//默认情况下，GORM 会使用 ID 作为表的主键

type WhiteBoard struct {
	Mode        BoardType `json:"mode"`    //模式
	Creator     string    `json:"creator"` //创建者
	Name        string    `json:"name"`
	DefaultPage string    `json:"defaultPage"`
	Model
	Pages []*Page `json:"pages" gorm:"-"` //页面信息
}

const (
	DefaultPageName       = "default"
	DefaultWhiteBoardName = "default"
)

type Page struct {
	Model
	WhiteBoardID string `json:"whiteBoardId" gorm:"column:whiteBoardId"` //所属白板的id
	DisplayName  string `json:"displayName"`                             //展示的名字
	Content      string `json:"-" gorm:"type:LONGTEXT"`                  //存储的一页上的所有图形对象,存储pageStringContent序列化后的字符串
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
