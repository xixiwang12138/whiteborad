package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"log"
	"server/dao"
	"server/logic"
	"server/models"
	"server/models/bind"
	"server/ws"
	"strconv"
	"time"
)

func registerPage(g *gin.RouterGroup) {
	g.GET("", Handler(GetPageVo))
	g.POST("", Handler(CreatPage))
	g.DELETE("", Handler(DeletePage))
	g.GET("/export", NoParamHandler(ExportPage))
}

func CreatPage(ctx *gin.Context, req *bind.NewPageReq) (any, error) {
	userId := GetUser(ctx)
	pageId, err := dao.PageRepo.CreatePage(req.BoardId, req.Name)
	if err != nil {
		return nil, err
	}
	if req.Data != "" {
		//import
		vo, err := logic.ImportPage(req.Data, pageId)
		if err != nil {
			return nil, err
		}
		//send loading page data to user
		err = ws.HubMgr.SendLoadMessage(req.BoardId, userId, vo)
		if err != nil {
			return nil, err
		}
	}
	return logic.GetBoardVO(req.BoardId)
}

func DeletePage(ctx *gin.Context, req *bind.PageReq) (any, error) {
	err := dao.PageRepo.DeleteByPK(req.PageId)
	if err != nil {
		return nil, err
	}
	return logic.GetBoardVO(req.BoardId)
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

func ExportPage(ctx *gin.Context) (any, error) {
	pageId := ctx.Query("pageId")
	page, err := logic.LoadPage(pageId)
	if err != nil {
		log.Println(err)
		return nil, errors.Wrap(err, "get page:"+pageId)
	}
	data, err := page.Encrypt()
	if err != nil {
		log.Println(err)
	}
	name := page.DisplayName + "_" + strconv.Itoa(int(time.Now().UnixMilli())) + "_export.wb"
	return struct {
		Name string `json:"name,omitempty"`
		Data string `json:"data"`
	}{name, string(data)}, nil
}
