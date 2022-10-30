package routes

import "github.com/gin-gonic/gin"

//注册所有路由
func registerBoard(g *gin.RouterGroup) {
	g.POST("/create", Handler(Register))
}

func Register(ctx *gin.Context, p *string) (string, error) {
	return "", nil
}
