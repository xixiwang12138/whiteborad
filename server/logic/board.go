package logic

import (
	"server/dao"
	"server/models"
)

// InitBoard 为指定用户初始化创建一个白板
//返回白板id和创建的默认的页的id
func InitBoard(userId int64) (int64, int64, error) {
	b, err := dao.WhiteBoardRepo.Init(userId)
	if err != nil {
		return 0, 0, err
	}
	pageId, err := dao.PageRepo.CreatePage(b, models.DefaultPageName)
	if err != nil {
		return 0, 0, err
	}
	return b, pageId, nil
}
