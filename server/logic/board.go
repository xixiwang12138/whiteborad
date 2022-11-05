package logic

import (
	"log"
	"server/common/cts"
	"server/common/repo"
	"server/dao"
	"server/models"
	"sync"
)

// InitBoard 为指定用户初始化创建一个白板
// 返回白板id和创建的默认的页的id
func InitBoard(userId int64) error {
	_, err := dao.WhiteBoardRepo.Init(userId)
	return err
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

func StoreBoard(bId int64) {
	pages, err := GetBoardPages(bId)
	if err != nil {
		log.Printf(cts.ErrorFormat, err)
		return
	}
	var wg sync.WaitGroup
	wg.Add(len(pages))
	for _, id := range pages {
		go func() {
			defer wg.Done()
			StorePage(id)
		}()
	}
	wg.Wait()
}
