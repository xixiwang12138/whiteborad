package routes

import (
	"encoding/base64"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
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
	if req.Data != "" {
		//新建一个有数据的页面，进行两次解码
		decode, err := base64Decode([]byte(req.Data))
		if err != nil {
			return nil, errors.Wrap(err, "invalid content")
		}
		buf, err := base64Decode(decode)
		if err != nil {
			return nil, errors.Wrap(err, "invalid content")
		}
		elements := make([]models.ElementKV, 0)
		err = json.Unmarshal(buf, &elements)
		if err != nil {
			return nil, errors.Wrap(err, "invalid content")
		}

		page, err := dao.PageRepo.FindByID(pageId)
		if err != nil {
			return nil, err
		}
		vo := &models.PageVO{
			Page:     page,
			Elements: elements,
		}
		err = ws.HubMgr.SendLoadMessage(req.BoardId, userId, vo)
		if err != nil {
			return nil, err
		}
	}
	if err != nil {
		return nil, err
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

const filePath = "D://"

func ExportPage(ctx *gin.Context) (any, error) {
	pageId := ctx.Query("pageId")

	page, err := logic.LoadPage(pageId)
	data := page.Elements
	bytes, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	fileData := base64Encode(base64Encode(bytes))
	name := page.DisplayName + "_" + strconv.Itoa(int(time.Now().UnixMilli())) + "_export.wb"
	return struct {
		Name string `json:"name,omitempty"`
		Data string `json:"data"`
	}{name, string(fileData)}, nil
}

func base64Encode(src []byte) []byte {
	return []byte(base64.StdEncoding.EncodeToString(src))
}

func base64Decode(src []byte) ([]byte, error) {
	return base64.StdEncoding.DecodeString(string(src))
}
