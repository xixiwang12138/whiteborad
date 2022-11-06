package routes

import (
	"github.com/gin-gonic/gin"
	"server/logic"
	"server/models"
	"server/models/bind"
)

func registerPage(g *gin.RouterGroup) {
	g.GET("/", Handler(GetPageVo))
}

func GetPageVo(ctx *gin.Context, req *bind.PageReq) (any, error) {
	page, err := logic.LoadPage(req.PageId)
	if err != nil {
		return nil, err
	}
	return struct {
		Page *models.PageVO `json:"page"`
	}{
		page,
	}, nil
}
