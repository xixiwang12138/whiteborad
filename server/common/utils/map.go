package utils

import (
	"fmt"
	"reflect"
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
	return m.data.Load(k)
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
