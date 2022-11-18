package logic

import (
	"github.com/go-redis/redis"
	"github.com/pkg/errors"
	"log"
	"server/common/cache"
	"server/common/sources"
	"server/common/utils"
	"server/dao"
	"server/models"
	"server/ws"
)

// ImportPage 在某个页面上导入文件，并保存到redis缓存中
func ImportPage(crypto string, pageId string) (*models.PageVO, error) {
	elements, err := models.Decrypt([]byte(crypto)) //StringStringMap
	page, err := dao.PageRepo.FindByID(pageId)
	if err != nil {
		return nil, err
	}
	voElements := make([]models.ElementKV, len(elements))
	//re generate id for elements
	//convert to element
	for i, element := range elements {
		id := utils.GenerateId()
		element.SetElementId(id)
		voElements[i], err = element.Convert()
		if err != nil {
			return nil, err
		}
	}
	vo := &models.PageVO{
		Page:     page,
		Elements: voElements,
	}
	//save to redis
	err = SaveStrStrElements2Cache(elements, pageId)
	if err != nil {
		return nil, err
	}
	return vo, err
}

// loadElementsFromCache 从Redis获取一个页面的所有图形，返回map[string]string形式
func loadElementsFromCache(pageId string) ([]models.StringStringElement, error) {
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
	res := make([]models.StringStringElement, len(cmders))
	for i, cmder := range cmders {
		s := cmder.(*redis.StringStringMapCmd).Val()
		res[i] = s
	}

	return res, nil
}

func SaveStrStrElements2Cache(stringElements []models.StringStringElement, pageId string) error {
	pipe := sources.RedisSource.Client.TxPipeline()
	for _, stringElement := range stringElements {
		id := stringElement.GetElementId()
		pipe.SAdd(cache.PageElementsKey(pageId), id)
		pipe.HMSet(cache.ElementKey(id), stringElement.UpwardTransformation())
	}
	_, err := pipe.Exec()
	if err != nil {
		return err
	}
	return nil
}

func SaveElements2Cache(elements []models.ElementKV, pageId string) error {
	pipe := sources.RedisSource.Client.TxPipeline()
	for _, e := range elements {
		id := e.GetElementId()
		pipe.SAdd(cache.PageElementsKey(pageId), id)
		elementKV, err := e.StringfyFiled()
		if err != nil {
			return err
		}
		pipe.HMSet(cache.ElementKey(id), elementKV)
	}
	_, err := pipe.Exec()
	if err != nil {
		return err
	}
	return nil
}

// StorePage 将元素以StringString的方式存储到数据库中
func StorePage(pageId string) error {
	res, err := loadElementsFromCache(pageId)
	//TODO 删除页面中所有元素
	if err != nil {
		return err
	}
	err = dao.PageRepo.SavePageContent(pageId, res)
	if err != nil {
		return err
	}
	return nil
}

// LoadPage 如果该白板内没有人在线的话，从数据库加载并将存储的结果加入到redis
// 如果有人在线的话，从redis查询后构造vo直接返回
func LoadPage(pageId string) (*models.PageVO, error) {
	var vo = &models.PageVO{}
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
		elementsString, err := loadElementsFromCache(pageId)
		if err != nil {
			return nil, err
		}
		elements := make([]models.ElementKV, len(elementsString))
		for i, stringElement := range elementsString {
			elements[i], err = stringElement.Convert()
			if err != nil {
				return nil, err
			}
		}
		vo.Page = page
		vo.Elements = elements
		return vo, nil
	}
	//if no user,build from db content
	vo, err = page.BuildVo()
	go func() {
		//save elements into redis
		stringElements, err := page.BuildStringStringElements()
		if err != nil {
			log.Println(err)
			return
		}
		err = SaveStrStrElements2Cache(stringElements, pageId)
		if err != nil {
			log.Println(err)
			return
		}
	}()
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
