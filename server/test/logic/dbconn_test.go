package logic

import (
	"fmt"
	"server/common/config"
	"server/common/sources"
	"server/models"
	"testing"
)

func BeforeAll() {
	sources.MysqlSource.Setup(&config.Config{MysqlConfig: &config.MySQLConfig{
		UserName: "root",
		Password: "FuKHc7TeCS",
		Address:  "175.178.81.93",
		Port:     "3306",
		DbName:   "board",
	}})
}

func TestConnect(t *testing.T) {
	sources.MysqlSource.Setup(&config.Config{MysqlConfig: &config.MySQLConfig{
		UserName: "root",
		Password: "FuKHc7TeCS",
		Address:  "175.178.81.93",
		Port:     "3306",
		DbName:   "board",
	}})
	fmt.Println(sources.MysqlSource.Db.AutoMigrate(&models.User{}, &models.WhiteBoard{}, &models.Page{}))
}
