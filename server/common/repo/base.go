package repo

import "server/common/sources"

type BaseRepo[T interface{}] struct{}

func (this *BaseRepo[T]) Create(o *T) error {
	return sources.MysqlSource.Db.Create(o).Error
}

func (this *BaseRepo[T]) FindByID(pk string) (*T, error) {
	var t *T
	err := sources.MysqlSource.Db.First(t, "id = ?", pk).Error
	return t, err
}
