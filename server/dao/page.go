package dao

import (
	"server/common/repo"
	"server/common/utils"
	"server/models"
)

var PageRepo *pageRepo

type pageRepo struct {
	repo.BaseRepo[models.Page]
}

func (this pageRepo) CreatePage(boardId int64, displayName string) (int64, error) {
	pageId := utils.GenerateId()
	p := &models.Page{
		ID:           pageId,
		WhiteBoardID: boardId,
		DisplayName:  displayName,
	}
	err := this.Create(p)
	if err != nil {
		return 0, err
	}
	return pageId, nil
}
