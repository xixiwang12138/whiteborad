package repo

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"server/common/sources"
)

//mysql的字段名称是不区分大小写的

type Condition struct {
	Filed string
	Opr   string
	Value string
}

var NotDeleted = &Condition{
	Filed: "DeleteTime",
	Opr:   "=",
	Value: "0",
}

type BaseRepo[T interface{}] struct{}

func (this *BaseRepo[T]) Create(o *T) error {
	err := sources.MysqlSource.Db.Create(o).Error
	if err != nil {
		return errors.Wrap(err, "create record")
	}
	return nil
}

func (this *BaseRepo[T]) FindByID(pk int64) (*T, error) {
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

func (this *BaseRepo[T]) Find(filter map[string]interface{}, conditions ...*Condition) ([]*T, error) {
	t := new([]*T)
	db := sources.MysqlSource.Db
	for _, condition := range conditions {
		db = db.Where(condition.Filed+" "+condition.Opr+" ?", condition.Value)
	}
	if filter != nil {
		db = db.Where(filter)
	}
	err := db.Find(t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) { //没有找到返回空
		return nil, nil
	}
	return *t, err
}

func (this *BaseRepo[T]) FindFields(filter map[string]interface{}, fields ...string) ([]*T, error) {
	t := new([]*T)
	db := sources.MysqlSource.Db
	if filter != nil {
		db = db.Where(filter)
	}
	err := db.Select(fields).Find(t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) { //没有找到返回空
		return nil, nil
	}
	return *t, err
}

func (this *BaseRepo[T]) FindPKArray(ids []int64) ([]*T, error) {
	t := new([]*T)
	db := sources.MysqlSource.Db
	err := db.Where(ids).Find(t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) { //没有找到返回空
		return nil, nil
	}
	return *t, err
}

func (this *BaseRepo[T]) UpdateFiled(pk int64, newValue map[string]interface{}) error {
	t := new(T)
	return sources.MysqlSource.Db.Model(t).Where("id = ?", pk).Updates(newValue).Error
}
