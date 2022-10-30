package models

type BoardType int8

const (
	ReadOnly BoardType = 0
	Editable BoardType = 1
)

//默认情况下，GORM 会使用 ID 作为表的主键

type WhiteBoard struct {
	ID      string    `json:"id"`      //使用雪花算法
	Mode    BoardType `json:"mode"`    //模式
	Creator string    `json:"creator"` //创建者
}

type Page struct {
	ID           string `json:"id"`           //页标识
	WhiteBoardID string `json:"whiteBoardId"` //所属白板的id
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
	ID         string    `json:"id"`
	PageId     string    `json:"pageId"`  //所属页面的id
	Creator    string    `json:"creator"` //创建者id
	CreateTime int64     `json:"createTime"`
	Type       GraphType `json:"type"`
	Content    []byte    `json:"content"`
	Deleted    bool      `json:"deleted"` //是否擦除
	//TODO undo redo
}
