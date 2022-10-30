package repo

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"server/common/sources"
)

//mysql的字段名称是不区分大小写的

type BaseRepo[T interface{}] struct{}

func (this *BaseRepo[T]) Create(o *T) error {
	return sources.MysqlSource.Db.Create(o).Error
}

func (this *BaseRepo[T]) FindByID(pk string) (*T, error) {
	t := new(T)
	err := sources.MysqlSource.Db.First(t, "id = ?", pk).Error
	if errors.Is(err, gorm.ErrRecordNotFound) { //没有找到返回空
		return nil, nil
	}
	return t, err
}

func (this *BaseRepo[T]) FindOne(filter map[string]interface{}) (*T, error) {
	t := new(T)
	err := sources.MysqlSource.Db.Where(filter).First(t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) { //没有找到返回空
		return nil, nil
	}
	return t, err
}
