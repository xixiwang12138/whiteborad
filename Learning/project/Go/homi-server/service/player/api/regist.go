package api

import (
	"github.com/gin-gonic/gin"
	"homi-server/common/api"
)

var (
	PlayerRouterConfig = api.BaseApiConfig{
		PORT:           ":8081",
		RouterGroupUrl: "/player",
	}
)

func InitPlayerApi() {
	//全局配置启动
	g := api.InitGin(&PlayerRouterConfig)

	//配置路由
	player := g.Group(PlayerRouterConfig.RouterGroupUrl)
	registerRouter(player)

	//启动
	if err := g.Run(PlayerRouterConfig.PORT); err != nil {
		//TODO 日志
	}
}

//注册所有路由
func registerRouter(g *gin.RouterGroup) {
	g.POST("/login", LoginHandler)
	g.POST("/logout", LogoutHandler)
}
