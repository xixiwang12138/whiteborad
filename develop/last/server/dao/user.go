package dao

import (
	"github.com/pkg/errors"
	"server/common/repo"
	"server/common/utils"
	"server/models"
	"time"
)

var UserRepo *userRepo = &userRepo{}
var UserJoinRepo *userJoinRepo = &userJoinRepo{}

type userRepo struct {
	repo.BaseRepo[models.User]
}

func (this *userRepo) Init(phone string, password string) (*models.User, error) {
	u := models.NewUser(phone, password)
	err := this.Create(u)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (this *userRepo) Reset(userId string, password string) error {
	return this.UpdateFiled(userId, map[string]interface{}{
		"password": password,
	})
}

type userJoinRepo struct {
	repo.BaseRepo[models.UserJoin]
}

func (this *userJoinRepo) Join(userId string, bId string) error {
	b, err := WhiteBoardRepo.FindByID(bId)
	if err != nil {
		return err
	}
	if b == nil {
		return errors.New("invalid board id")
	}
	record, err := this.FindOne(map[string]interface{}{
		"user_id":  userId,
		"board_id": bId,
	})
	if err != nil {
		return err
	}
	if record == nil {
		//插入
		err := this.Create(&models.UserJoin{
			UserId:        userId,
			BoardId:       bId,
			LastEnterTime: time.Now().UnixMilli(),
			ID:            utils.GenerateId(),
		})
		if err != nil {
			return err
		}
	} else {
		err := this.UpdateFiled(record.ID, map[string]interface{}{
			"last_enter_time": time.Now().UnixMilli(),
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func (this *userJoinRepo) GetUserJoins(uId string) ([]*models.WhiteBoard, error) {
	joins, err := this.Find(map[string]interface{}{
		"user_id": uId,
	})
	if err != nil {
		return nil, err
	}
	ids := make([]string, len(joins))
	for i, j := range joins {
		ids[i] = j.BoardId
	}
	return WhiteBoardRepo.FindPKArray(ids, &repo.Condition{Filed: "creator", Opr: "!=", Value: uId})
}
