package models

import (
	"reflect"
	"server/common/utils"
)

var ElementFiledMap utils.FiledTypeMap = map[string]reflect.Kind{
	"id":              reflect.String,
	"type":            reflect.Int8,
	"x":               reflect.Float64,
	"y":               reflect.Float64,
	"strokeColor":     reflect.String,
	"backgroundColor": reflect.String,
	"strokeWidth":     reflect.Float64,
	"opacity":         reflect.Float64,
	"width":           reflect.Float64,
	"height":          reflect.Float64,
	"angle":           reflect.Float64,
	"isDeleted":       reflect.Int8,

	"genericType": reflect.String,
	"linearType":  reflect.String,
	"fontSize":    reflect.Float64,
	"text":        reflect.String,
	"textAlign":   reflect.String,
	"points":      reflect.Array,
	"fontStyle":   reflect.String,
}

var ElementFieldsWhichArray = []string{"points"}
