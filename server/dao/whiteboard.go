package dao

import (
	"log"
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
func (this *whiteBoardRepo) Init(creator string, boardName ...string) (string, error) {
	boardId := utils.GenerateId() //1590693879883694080
	//create default page for this whiteboard
	pageId, err := PageRepo.CreatePage(boardId, models.DefaultPageName) //1590693932933251072
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
		return "", err
	}
	log.Println("create board, ", "name:", wb.Name)
	return boardId, nil
}

func (this *whiteBoardRepo) DefaultPageId(boardId string) (string, error) {
	b, err := this.FindByID(boardId)
	if err != nil {
		return "", err
	}
	return b.DefaultPage, nil
}

func (this *whiteBoardRepo) GetBoardInfo(boardId string) (*models.WhiteBoard, error) {
	b, err := this.FindByID(boardId)
	if b == nil {
		return nil, nil
	}
	pages, err := PageRepo.GetBoardPages(boardId)
	if err != nil {
		return nil, err
	}
	if pages == nil || len(pages) == 0 {
		pages = make([]*models.Page, 0)
	}
	b.Pages = pages
	return b, nil
}
