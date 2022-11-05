package routes

import (
	"github.com/gin-gonic/gin"
	"server/logic"
	"server/models/bind"
)

func registerPage(g *gin.RouterGroup) {
	g.GET("/", Handler(GetPageVo))
}

func GetPageVo(ctx *gin.Context, req *bind.PageReq) (any, error) {
	return logic.LoadPage(req.PageId)
}
