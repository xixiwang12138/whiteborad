package dao

import (
	"server/common/repo"
	"server/models"
)

var WhiteBoardRepo *whiteBoardRepo

type whiteBoardRepo struct {
	repo.BaseRepo[models.WhiteBoard]
}
