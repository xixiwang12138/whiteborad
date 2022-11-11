package logic

import (
	"encoding/json"
	"github.com/go-redis/redis"
	"github.com/pkg/errors"
	"server/common/cache"
	"server/common/sources"
	"server/dao"
	"server/models"
	"server/ws"
)

// PageContentFromRedis []string 返回的element序列化后的数据
func PageContentFromRedis(pageId string) ([]string, error) {
	elements, err := getAllGraph(pageId)
	if err != nil {
		return nil, err
	}

	//use pipeline to read all hash
	//Tips: MGET() can only be used simple string struct
	pipe := sources.RedisSource.Client.TxPipeline()

	for _, v := range elements {
		key := cache.ElementKeyString(v)
		pipe.HGetAll(key)
	}

	cmders, err := pipe.Exec()
	if err != nil {
		return nil, err
	}

	res := make([]string, len(cmders))
	// for each value of cmders, val is map[string]string
	// map[field]value
	for i, cmder := range cmders {
		s := cmder.(*redis.StringStringMapCmd).Val()
		// there is no need to convert to struct
		bytes, err := json.Marshal(s)
		if err != nil {
			return nil, err
		}
		res[i] = string(bytes)
	}
	return res, nil
}

func StorePage(pageId string) error {
	res, err := PageContentFromRedis(pageId)
	if err != nil {
		return err
	}
	err = dao.PageRepo.SavePageContent(pageId, res)
	if err != nil {
		return err
	}
	return nil
}

// LoadPage 从数据库中加载一个页面上的所有对象并缓存至Redis中
func LoadPage(pageId string) (*models.PageVO, error) {
	var vo *models.PageVO
	page, err := dao.PageRepo.FindByID(pageId)
	if err != nil {
		return nil, err
	}
	if page == nil {
		return nil, errors.New("invalid page id")
	}
	//judge there is anybody in the board
	if ws.HubMgr.HubCreated(page.WhiteBoardID) {
		//someone in board, from redis to build content
		elementsStringArray, err := PageContentFromRedis(pageId)
		if err != nil {
			return nil, err
		}
		c := models.DataToStringFiled(elementsStringArray)
		page.Content = c
	}
	//if no user, from db
	vo, err = page.BuildVo()
	if err != nil {
		return nil, err
	}
	// loading to redis - pipeline
	elements := vo.Elements //all elements in a page, each element is map[string]any
	pipe := sources.RedisSource.Client.TxPipeline()
	for _, element := range elements {
		id := element.GetElementId()
		models.StringElementArray(element)
		pipe.HMSet(cache.ElementKey(id), element)
	}
	_, err = pipe.Exec()
	if err != nil {
		return nil, err
	}

	// send response to front
	return vo, nil
}

func Load(boardId string, pageId string) (*models.PageVO, error) {
	if pageId == "" {
		//需要加载的是默认page
		defaultPageId, err := dao.WhiteBoardRepo.DefaultPageId(boardId)
		if err != nil {
			return nil, err
		}
		pageId = defaultPageId
	}
	return LoadPage(pageId)
}

func getAllGraph(pageId string) ([]string, error) {
	return sources.RedisSource.Client.SMembers(cache.PageElementsKey(pageId)).Result()
}
