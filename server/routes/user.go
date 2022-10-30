package routes

import "github.com/gin-gonic/gin"

//注册所有路由
func registerUser(g *gin.RouterGroup) {
	g.POST("/register", Handler(Register))
	g.POST("/login", Handler(Register))
}

func Register(ctx *gin.Context, p *string) (string, error) {
	return "", nil
}
