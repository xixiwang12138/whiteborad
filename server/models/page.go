package models

import (
	"encoding/json"
	"github.com/pkg/errors"
	"log"
	"server/common/utils"
	"sync"
)

type BoardType int8

const (
	Editable BoardType = 0
	ReadOnly BoardType = 1
)

// Model 默认情况下，GORM 会使用 ID 作为表的主键
type Model struct {
	ID         string `json:"id"`                                     //主键
	CreatTime  int64  `json:"creatTime" gorm:"autoCreateTime:milli"`  //创建时间
	UpdateTime int64  `json:"updateTime" gorm:"autoUpdateTime:milli"` //最后一次更新时间
	DeleteTime int64  `json:"deleteTime"`                             //删除时间
}

type WhiteBoard struct {
	Mode        BoardType `json:"mode"`    //模式
	Creator     string    `json:"creator"` //创建者
	Name        string    `json:"name"`
	DefaultPage string    `json:"defaultPage"`
	Model
	Pages []*Page `json:"pages" gorm:"-"` //页面信息
}

const (
	DefaultPageName       = "页面1"
	DefaultWhiteBoardName = "默认"
)

type Page struct {
	Model
	WhiteBoardID string `json:"whiteBoardId" gorm:"column:whiteBoardId"` //所属白板的id
	DisplayName  string `json:"displayName"`                             //展示的名字
	Content      string `json:"-" gorm:"type:LONGTEXT"`                  //存储的一页上的所有图形对象,存储pageStringContent序列化后的字符串
}

type PageVO struct {
	*Page
	Elements []ElementKV `json:"elements"`
}

// Encrypt 加密一个页面的所有数据，存储的时候采用与数据库一致的StringStringMap
func (v *PageVO) Encrypt() ([]byte, error) {
	data := v.Elements
	//convert elements to StringStringMap, consistent with the database
	for _, elementKV := range data {
		_, err := elementKV.StringfyFiled()
		if err != nil {
			return nil, err
		}
	}
	bytes, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	return utils.Base64Encode(utils.Base64Encode(bytes)), nil
}

func Decrypt(data []byte) ([]StringStringElement, error) {
	//新建一个有数据的页面，进行两次解码
	decode, err := utils.Base64Decode(data)
	if err != nil {
		return nil, errors.Wrap(err, "invalid content")
	}
	buf, err := utils.Base64Decode(decode)
	if err != nil {
		return nil, errors.Wrap(err, "invalid content")
	}
	elements := make([]StringStringElement, 0)
	err = json.Unmarshal(buf, &elements)
	if err != nil {
		return nil, errors.Wrap(err, "invalid content")
	}
	return elements, nil
}

func (p *Page) BuildStringStringElements() ([]StringStringElement, error) {
	//get StringStringMap
	var curElements []StringStringElement
	err := json.Unmarshal([]byte(p.Content), &curElements)
	if err != nil {
		return nil, err
	}
	return curElements, nil
}

func (p *Page) BuildVo() (*PageVO, error) {
	res := &PageVO{
		Page:     p,
		Elements: make([]ElementKV, 0),
	}
	//if this.page has no content, return empty array
	if res.Content == "" {
		return res, nil
	}

	//JSON string -> StringStringMap
	curElements, err := p.BuildStringStringElements()
	if err != nil {
		return nil, err
	}
	length := len(curElements)

	//convert StringStringMap -> StringAnyMap
	result := make([]ElementKV, length)
	var wg sync.WaitGroup
	wg.Add(length)
	for i, e := range curElements {
		e := e
		i := i
		go func() {
			defer wg.Done()
			newValue, err := utils.MapValueConvert(ElementFiledMap, e)
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
