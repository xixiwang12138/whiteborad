package logic

import (
	"server/common/repo"
	"server/dao"
	"server/models"
)

// InitBoard 为指定用户初始化创建一个白板
// 返回白板id和创建的默认的页的id
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

// GetBoards 返回用户创建的所有的board
func GetBoards(userId int64) ([]*models.WhiteBoard, error) {
	list, err := dao.WhiteBoardRepo.Find(map[string]interface{}{
		"Creator": userId,
	}, repo.NotDeleted)
	if err != nil {
		return nil, err
	}
	return list, nil
}

func GetBoardPages(boardId int64) ([]int64, error) {
	res, err := dao.PageRepo.FindFields(map[string]interface{}{
		"whiteBoardId": boardId,
	}, "id")
	if err != nil {
		return nil, err
	}
	result := make([]int64, len(res))
	for i := 0; i < len(res); i++ {
		result[i] = res[i].ID
	}
	return result, nil
}
