package models

import (
	"reflect"
	"server/common/utils"
)

var ElementFiledMap utils.FiledTypeMap = map[string]reflect.Kind{
	"id":              reflect.Int64,
	"type":            reflect.Int8,
	"x":               reflect.Float64,
	"y":               reflect.Float64,
	"strokeColor":     reflect.String,
	"backGroundColor": reflect.String,
	"strokeWidth":     reflect.Float64,
	"opacity":         reflect.Float64,
	"width":           reflect.Float64,
	"height":          reflect.Float64,
	"angle":           reflect.Float64,
	"isDeleted":       reflect.Bool,
	"updated":         reflect.Bool,
	"fontSize":        reflect.Float64,
	"fontFamily":      reflect.Float64,
	"text":            reflect.String,
	"baseline":        reflect.Float64,
	"textAlign":       reflect.Int8,
	"verticalAlign":   reflect.Int8,
	"containerId":     reflect.Int64,
	"originText":      reflect.Float64,
}

//type BaseElement struct {
//	ID   int64     `json:"id"`
//	Type GraphType `json:"type"`
//	*Location
//	StrokeColor     string  `json:"strokeColor"`
//	BackGroundColor string  `json:"backGroundColor"`
//	StrokeWidth     float64 `json:"strokeWidth"`
//	Opacity         float64 `json:"opacity"`
//	Width           float64 `json:"width"`
//	Height          float64 `json:"height"`
//	Angle           float64 `json:"angle"`
//	IsDeleted       bool    `json:"isDeleted"`
//	Updated         int64   `json:"updated"`
//}
//
//func (e *BaseElement) GetElementId() int64 {
//	return e.ID
//}
//
//type TextElement struct {
//	*BaseElement
//	FontSize      float64       `json:"fontSize"`
//	FontFamily    float64       `json:"fontFamily"`
//	Text          string        `json:"text"`
//	Baseline      float64       `json:"baseline"`
//	TextAlign     TextAlign     `json:"textAlign"`
//	VerticalAlign VerticalAlign `json:"verticalAlign"`
//	ContainerId   int64         `json:"containerId"`
//	OriginText    string        `json:"originText"`
//}
//
//type TextAlign int8
//type VerticalAlign int8
//
//func (e *TextElement) GetElementId() int64 {
//	return e.ID
//}
//
//type Location struct {
//	X float64 `json:"x"`
//	Y float64 `json:"y"`
//}
