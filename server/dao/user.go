package dao

import (
	"server/common/repo"
	"server/common/utils"
	"server/models"
)

var UserRepo *userRepo = &userRepo{}

type userRepo struct {
	repo.BaseRepo[models.User]
}

func (this *userRepo) Init(phone string, password string) (int64, error) {
	id := utils.GenerateId()
	u := &models.User{
		ID:       id,
		Phone:    phone,
		Password: password,
	}
	err := this.Create(u)
	if err != nil {
		return 0, err
	}
	return id, nil
}
