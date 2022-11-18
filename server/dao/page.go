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

func (this *pageRepo) CreatePage(boardId string, displayName string) (string, error) {
	pageId := utils.GenerateId()
	p := &models.Page{
		Model:        models.Model{ID: pageId},
		WhiteBoardID: boardId,
		DisplayName:  displayName,
	}
	err := this.Create(p)
	if err != nil {
		return "", err
	}
	return pageId, nil
}

func (this *pageRepo) SavePageContent(pageId string, data []models.StringStringElement) error {
	return this.UpdateFiled(pageId, map[string]interface{}{
		"content": utils.Serialize(data),
	})
}

func (this *pageRepo) GetPageVo(pageId string) (*models.PageVO, error) {
	page, err := this.FindByID(pageId)
	if err != nil {
		return nil, err
	}
	if page == nil {
		return nil, nil
	}
	return page.BuildVo()
}

func (this *pageRepo) GetBoardPages(boardId string) ([]*models.Page, error) {
	return this.Find(map[string]interface{}{
		"whiteBoardId": boardId,
	})
}
