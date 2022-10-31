package models

type BaseElement struct {
	ID int64 `json:"id"`
	Location
	StrokeColor     string  `json:"strokeColor"`
	BackGroundColor string  `json:"backGroundColor"`
	StrokeWidth     float64 `json:"strokeWidth"`
	Opacity         float64 `json:"opacity"`
	Width           float64 `json:"width"`
	Height          float64 `json:"height"`
	Angle           float64 `json:"angle"`
	IsDeleted       bool    `json:"isDeleted"`
	Updated         float64 `json:"updated"`
}

type TextElement struct {
	*BaseElement
	FontSize      float64       `json:"fontSize"`
	FontFamily    float64       `json:"fontFamily"`
	Text          string        `json:"text"`
	Baseline      float64       `json:"baseline"`
	TextAlign     TextAlign     `json:"textAlign"`
	VerticalAlign VerticalAlign `json:"verticalAlign"`
	ContainerId   int64         `json:"containerId"`
	OriginText    float64       `json:"originText"`
}

type Location struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}
