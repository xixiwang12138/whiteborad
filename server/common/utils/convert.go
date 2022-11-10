package utils

import (
	"encoding/json"
	"github.com/pkg/errors"
	"reflect"
	"strconv"
)

type FiledTypeMap map[string]reflect.Kind

// MapValueConvert convert StringStringMap to a correct type according to fieldMap
// if v's key is not in filedMap, will return error
func MapValueConvert(filedMap FiledTypeMap, v map[string]string) (map[string]interface{}, error) {
	result := make(map[string]any)
	for field, value := range v {
		kind, ok := filedMap[field]
		if !ok {
			// not in field-type map
			return nil, errors.New(field + " not in field-type map")
		}
		switch kind {
		case reflect.String:
			// no need convert
			result[field] = value
			continue
		case reflect.Bool:
			parseBool, err := strconv.ParseBool(value)
			if err != nil {
				return nil, err
			}
			result[field] = parseBool
		case reflect.Int:
			parseValue, err := strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = int(parseValue)
		case reflect.Int8:
			parseValue, err := strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = int8(parseValue)
		case reflect.Int16:
			parseValue, err := strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = int16(parseValue)
		case reflect.Int32:
			parseValue, err := strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = int32(parseValue)
		case reflect.Int64:
			parseValue, err := strconv.ParseInt(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = int64(parseValue)
		case reflect.Uint:
			parseValue, err := strconv.ParseUint(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = uint(parseValue)
		case reflect.Uint8:
			parseValue, err := strconv.ParseUint(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = uint8(parseValue)
		case reflect.Uint16:
			parseValue, err := strconv.ParseUint(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = uint16(parseValue)
		case reflect.Uint32:
			parseValue, err := strconv.ParseUint(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = uint32(parseValue)
		case reflect.Uint64:
			parseValue, err := strconv.ParseUint(value, 10, 64)
			if err != nil {
				return nil, err
			}
			result[field] = uint64(parseValue)
		case reflect.Float32:
			parseValue, err := strconv.ParseFloat(value, 64)
			if err != nil {
				return nil, err
			}
			result[field] = float32(parseValue)
		case reflect.Float64:
			parseValue, err := strconv.ParseFloat(value, 64)
			if err != nil {
				return nil, err
			}
			result[field] = parseValue
		case reflect.Array:
			var arrayData []float64
			err := json.Unmarshal([]byte(value), &arrayData)
			if err != nil {
				return nil, err
			}
			result[field] = arrayData
		default:
			panic("no-basic data type is not supported")
		}
	}
	return result, nil
}
