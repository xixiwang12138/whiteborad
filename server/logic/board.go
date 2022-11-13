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
func InitBoard(userId string) error {
	_, err := dao.WhiteBoardRepo.Init(userId)
	return err
}

// GetBoards 返回用户创建的所有的board
func GetBoards(userId string) ([]*models.WhiteBoard, error) {
	list, err := dao.WhiteBoardRepo.Find(map[string]interface{}{
		"creator": userId,
	}, repo.NotDeleted)
	if err != nil {
		return nil, err
	}
	return list, nil
}

func GetBoardPages(boardId string) ([]string, error) {
	res, err := dao.PageRepo.FindFields(map[string]interface{}{
		"whiteBoardId": boardId,
	}, "id")
	if err != nil {
		return nil, err
	}
	result := make([]string, len(res))
	for i := 0; i < len(res); i++ {
		result[i] = res[i].ID
	}
	return result, nil
}

func StoreBoard(bId string) {
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

// GetBoardVO 从数据库中load
func GetBoardVO(boardId string) (*models.WhiteBoard, error) {
	b, err := dao.WhiteBoardRepo.FindByID(boardId)
	if err != nil {
		return nil, err
	}
	p, err := dao.PageRepo.GetBoardPages(boardId)
	if err != nil {
		return nil, err
	}
	b.Pages = p
	return b, err
}
