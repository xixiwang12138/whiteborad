package logic

import (
	"encoding/json"
	"github.com/go-redis/redis"
	"server/common/cache"
	"server/common/sources"
	"server/dao"
	"server/models"
)

func StorePage(pageId int64) error {
	elements, err := getAllGraph(pageId)
	if err != nil {
		return err
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
		return err
	}

	res := make([]string, len(cmders))
	// for each value of cmders, val is map[string]string
	// map[field]value
	for i, cmder := range cmders {
		s := cmder.(*redis.StringStringMapCmd).Val()
		// there is no need to convert to struct
		bytes, err := json.Marshal(s)
		if err != nil {
			return err
		}
		res[i] = string(bytes)
	}

	err = dao.PageRepo.SavePageContent(pageId, res)
	if err != nil {
		return err
	}
	return nil
}

// LoadPage 从数据库中加载一个页面上的所有对象并缓存至Redis中
func LoadPage(pageId int64) (*models.PageVO, error) {
	vo, err := dao.PageRepo.GetPageVo(pageId)
	if err != nil {
		return nil, nil
	}
	// loading to redis - pipeline
	elements := vo.Elements //all elements in a page, each element is map[string]any
	pipe := sources.RedisSource.Client.TxPipeline()
	for _, element := range elements {
		id := element.GetElementId()
		pipe.HMSet(cache.ElementKey(id), element)
	}
	_, err = pipe.Exec()
	if err != nil {
		return nil, err
	}

	// send response to front
	return vo, nil
}

func Load(boardId int64, pageId int64) (*models.PageVO, error) {
	if pageId == 0 {
		//需要加载的是默认page
		defaultPageId, err := dao.WhiteBoardRepo.DefaultPageId(boardId)
		if err != nil {
			return nil, err
		}
		pageId = defaultPageId
	}
	return LoadPage(pageId)
}

func getAllGraph(pageId int64) ([]string, error) {
	return sources.RedisSource.Client.SMembers(cache.PageElementsKey(pageId)).Result()
}
