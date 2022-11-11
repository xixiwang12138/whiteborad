package sources

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"server/common/config"
)

var MysqlSource = &mysqlSource{}

func init() {
	DataSourceContext.RegisterSource(MysqlSource)
}

type mysqlSource struct {
	Db *gorm.DB
}

func (this *mysqlSource) ConfigAvailable(config *config.Config) bool {
	if config.RedisConfig != nil {
		return true
	}
	return false
}

func (this *mysqlSource) Setup(config *config.Config) {
	this.connect(config)
}

func (this *mysqlSource) connect(config *config.Config) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", config.MysqlConfig.UserName, config.MysqlConfig.Password,
		config.MysqlConfig.Address, config.MysqlConfig.Port, config.MysqlConfig.DbName)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Panicf("[redisdata.Conect]:%s", err)
	}
	log.Printf("[mysqldata.Setup]:Setup successfully")
	this.Db = db
}

func (this *mysqlSource) Close() {}
