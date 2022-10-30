package utils

import "sync"

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
