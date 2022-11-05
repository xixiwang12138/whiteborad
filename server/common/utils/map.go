package utils

import (
	"fmt"
	"reflect"
	"strconv"
	"sync"
)

type ConcurrentMap[K int64 | string, V interface{}] struct {
	data *sync.Map
}

func NewConcurrentMap[K int64 | string, V interface{}]() *ConcurrentMap[K, V] {
	return &ConcurrentMap[K, V]{data: new(sync.Map)}
}

func (m *ConcurrentMap[K, V]) Set(k K, v V) {
	m.data.Store(k, v)
}

func (m *ConcurrentMap[K, V]) Get(k K) (V, bool) {
	originData, ok := m.data.Load(k)
	if !ok {
		res := new(V)
		return *res, false
	}
	res := originData.(V)
	return res, ok
}

func (m *ConcurrentMap[K, V]) Delete(k K) {
	m.data.Delete(k)
}

func (m *ConcurrentMap[K, V]) Has(k K) bool {
	_, ok := m.data.Load(k)
	return ok
}

func (m *ConcurrentMap[K, V]) Data() *sync.Map {
	return m.data
}

// ToMap 结构体转为Map[string]interface{}
func ToMap(in interface{}, tagName string) (map[string]interface{}, error) {
	out := make(map[string]interface{})
	v := reflect.ValueOf(in)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct { // 非结构体返回错误提示
		return nil, fmt.Errorf("ToMap only accepts struct or struct pointer; got %T", v)
	}

	t := v.Type()
	// 遍历结构体字段
	// 指定tagName值为map中key;字段值为map中value
	for i := 0; i < v.NumField(); i++ {
		fi := t.Field(i)
		if tagValue := fi.Tag.Get(tagName); tagValue != "" {
			out[tagValue] = v.Field(i).Interface()
		}
	}
	return out, nil
}

func StringMap2Struct[T any](m map[string]string, t *T) {
	tValue := reflect.ValueOf(t)
	tType := reflect.TypeOf(&t)
	//traverse all field of struct
	for i := 0; i < tType.NumField(); i++ {
		field := tType.Field(i) //field obj
		fieldName := field.Name //field name
		fieldType := field.Type //field type
		fieldTag := field.Tag   //field tag

		jsonTag := fieldTag.Get("json")
		strVal, ok := m[jsonTag]
		if !ok {
			continue
		}

		//compare mapVal and filedType
		if fieldType.Kind() == reflect.String {
			tValue.Elem().FieldByName(fieldName).SetString(strVal)
		} else {
			setBool := func() {
				parseBool, err := strconv.ParseBool(strVal)
				if err != nil {
					panic(err)
				}
				tValue.Elem().FieldByName(fieldName).SetBool(parseBool)
			}
			setInt := func() {
				parseInt, err := strconv.ParseInt(strVal, 10, 64)
				if err != nil {
					panic(err)
				}
				tValue.Elem().FieldByName(fieldName).SetInt(parseInt)
			}
			setUint := func() {
				parseInt, err := strconv.ParseUint(strVal, 10, 64)
				if err != nil {
					panic(err)
				}
				tValue.Elem().FieldByName(fieldName).SetUint(parseInt)
			}
			setFloat := func() {
				f, err := strconv.ParseFloat(strVal, 64)
				if err != nil {
					panic(err)
				}
				tValue.Elem().FieldByName(fieldName).SetFloat(f)
			}
			switch fieldType.Kind() {
			case reflect.Bool:
				setBool()
			case reflect.Int:
				setInt()
			case reflect.Int8:
				setInt()
			case reflect.Int16:
				setInt()
			case reflect.Int32:
				setInt()
			case reflect.Int64:
				setInt()
			case reflect.Uint:
				setUint()
			case reflect.Uint8:
				setUint()
			case reflect.Uint16:
				setUint()
			case reflect.Uint32:
				setUint()
			case reflect.Uint64:
				setUint()
			case reflect.Float32:
				setFloat()
			case reflect.Float64:
				setFloat()
			default:
				panic("no-basic data type is not supported")
			}
		}
	}
}
