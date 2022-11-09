package dao

import (
	"server/common/repo"
	"server/common/utils"
	"server/models"
)

var WhiteBoardRepo *whiteBoardRepo = &whiteBoardRepo{}

type whiteBoardRepo struct {
	repo.BaseRepo[models.WhiteBoard]
}

// Init 为指定用户创建一个白板（包含一个默认的页）
// 返回白板id
func (this *whiteBoardRepo) Init(creator int64, boardName ...string) (int64, error) {
	boardId := utils.GenerateId()
	//create default page for this whiteboard
	pageId, err := PageRepo.CreatePage(boardId, models.DefaultPageName)
	name := models.DefaultWhiteBoardName
	if !(boardName == nil || len(boardName) == 0 || len(boardName) >= 2) {
		name = boardName[0]
	}
	wb := &models.WhiteBoard{
		Model:       models.Model{ID: boardId},
		Mode:        models.Editable,
		Creator:     creator,
		Name:        name,
		DefaultPage: pageId,
	}
	err = this.Create(wb)
	if err != nil {
		return 0, err
	}
	return boardId, nil
}

func (this *whiteBoardRepo) DefaultPageId(boardId int64) (int64, error) {
	b, err := this.FindByID(boardId)
	if err != nil {
		return 0, err
	}
	return b.DefaultPage, nil

}
