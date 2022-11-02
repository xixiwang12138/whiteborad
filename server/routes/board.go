package routes

import (
	"github.com/gin-gonic/gin"
	"server/logic"
	"server/models"
)

//注册所有路由
func registerBoard(g *gin.RouterGroup) {
	g.GET("/boards", NoParamHandler(GetBoards))
}

func GetBoards(ctx *gin.Context) ([]*models.WhiteBoard, error) {
	userId := GetUser(ctx)
	boards, err := logic.GetBoards(userId)
	if err != nil {
		return nil, err
	}
	return boards, nil
}
