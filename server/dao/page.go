package dao

import (
	"server/common/repo"
	"server/common/utils"
	"server/models"
)

var PageRepo *pageRepo = &pageRepo{}

type pageRepo struct {
	repo.BaseRepo[models.Page]
}

func (this *pageRepo) CreatePage(boardId int64, displayName string) (int64, error) {
	pageId := utils.GenerateId()
	p := &models.Page{
		Model:        models.Model{ID: pageId},
		WhiteBoardID: boardId,
		DisplayName:  displayName,
	}
	err := this.Create(p)
	if err != nil {
		return 0, err
	}
	return pageId, nil
}

func (this *pageRepo) SavePageContent(pageId int64, data []string) error {
	return this.UpdateFiled(pageId, map[string]interface{}{
		"content": models.DataToStringFiled(data),
	})
}

func (this *pageRepo) GetPageVo(pageId int64) (*models.PageVO, error) {
	page, err := this.FindByID(pageId)
	if err != nil {
		return nil, err
	}
	if page == nil {
		return nil, nil
	}
	return page.BuildVo()
}
