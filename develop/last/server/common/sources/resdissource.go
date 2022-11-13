package sources

import (
	"github.com/go-redis/redis"
	"github.com/jinzhu/copier"
	"github.com/pkg/errors"
	"log"
	"server/common/config"
	"server/common/utils"
	"strconv"
	"time"
)

var RedisSource = &redisSource{}

func init() {
	DataSourceContext.RegisterSource(RedisSource)
}

type redisSource struct {
	Client *redis.Client
}

func (this *redisSource) ConfigAvailable(config *config.Config) bool {
	if config.RedisConfig != nil {
		return true
	}
	return false
}

func (this *redisSource) Setup(config *config.Config) {
	this.connect(config)
}

func (this *redisSource) connect(config *config.Config) {
	conf := config.RedisConfig
	if conf == nil {
		return
	}
	options := &redis.Options{}
	err := copier.Copy(options, conf)
	if err != nil {
		log.Panicf("[redisdata.Setup]:%s", err)
	}
	this.Client = redis.NewClient(options)
	//测试连接
	_, err = this.Client.Ping().Result()
	if err != nil {
		log.Panicf("[redisdata.Conect]:%s", err)
	}
	log.Printf("[redisdata.Setup]:Setup successfully:%v", conf)
}

// HMSet 向哈希表中加入一个对象
func (this *redisSource) HMSet(key string, srt interface{}) error {
	m, err := utils.ToMap(srt, "json")
	if err != nil {
		return err
	}
	if err := this.Client.HMSet(key, m).Err(); err != nil {
		return errors.Wrap(err, "HMSet cache key ==========> "+key)
	}
	return nil
}

// HSet 向哈希表中插入字符串
func (this *redisSource) HSet(key string, field string, value interface{}) error {
	if err := this.Client.HSet(key, field, value).Err(); err != nil {
		return errors.Wrap(err, "HSet cache key ==========> "+key)
	}
	return nil
}

// HGet 仅获取哈希表中值的字符串
func (this *redisSource) HGet(key string, field string) (string, error) {
	str, err := this.Client.HGet(key, field).Result()
	if err != nil {
		return "", errors.Wrap(err, "HGet cache key ==========> "+key)
	}
	return str, nil
}

func (this *redisSource) HDel(key string, field string) error {
	err := this.Client.HDel(key, field).Err()
	if err != nil {
		return errors.Wrap(err, "HDel cache key ==========> "+key)
	}
	return nil
}

func (this *redisSource) Get(key string) (string, error) {
	str, err := this.Client.Get(key).Result()
	if err != nil {
		if err.Error() == "redis:nil" {
			return "", nil
		}
		//log.Printf("[redisSource.Get]:%s", err)
		return "", errors.Wrap(err, "Get cache key ==========> "+key)
	}
	return str, nil
}

func (this *redisSource) SetOne(key string, value string, expSec time.Duration) error {
	if err := this.Client.Set(key, value, expSec*time.Second).Err(); err != nil {
		return errors.Wrap(err, "Set To Cache ==========> "+key)
	}
	return nil
}

func (this *redisSource) SetMany(values map[string]any, exp time.Duration) error {
	kvs := make([]any, len(values)*2)
	i := 0
	for k, v := range values {
		kvs[i], kvs[i+1] = k, v
		i += 2
	}
	if err := this.Client.MSet(kvs...).Err(); err != nil {
		return errors.Wrap(err, " Set Many To Cache ==========> "+strconv.Itoa(len(values)))
	}
	return nil
}

func (this *redisSource) Del(keys ...string) error {
	if err := this.Client.Del(keys...).Err(); err != nil {
		return errors.Wrap(err, "==========> Delete ")
	}
	return nil
}

func (this *redisSource) Close() {
	err := this.Client.Close()
	if err != nil {
		log.Printf("[redisSource.Close]:")
	}
}
