package dao

import (
	"server/common/repo"
	"server/common/utils"
	"server/models"
)

var WhiteBoardRepo *whiteBoardRepo

type whiteBoardRepo struct {
	repo.BaseRepo[models.WhiteBoard]
}

// Init 为指定用户创建一个白板（包含一个默认的页）
// 返回白板id
func (this *whiteBoardRepo) Init(creator int64) (int64, error) {
	boardId := utils.GenerateId()
	wb := &models.WhiteBoard{
		ID:      boardId,
		Mode:    models.Editable,
		Creator: creator,
	}
	err := this.Create(wb)
	if err != nil {
		return 0, err
	}
	return boardId, nil
}
