package routes

import (
	"encoding/base64"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"server/common/utils"
	"server/logic"
	"server/models"
	"server/models/bind"
	"time"
)

func registerPage(g *gin.RouterGroup) {
	g.GET("/", Handler(GetPageVo))
	g.GET("/export", ExportPage)
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

const filePath = "/home/data/"

func ExportPage(ctx *gin.Context) {
	req := &bind.PageReq{}
	err := ctx.ShouldBind(req)
	if err != nil {
		return
	}
	page, err := logic.LoadPage(req.PageId)
	data := page.Elements
	bytes, err := json.Marshal(data)
	if err != nil {
		ctx.JSON(500, "invalid page content")
		return
	}
	fileData := base64Encode(base64Encode(bytes))
	name := page.DisplayName + time.Now().String() + "_export.wb"

	err = utils.WriteFile(filePath+name, fileData)
	if err != nil {
		ctx.JSON(500, "some error occur")
		return
	}

	ctx.Header("Content-Type", "application/octet-stream")
	//强制浏览器下载
	ctx.Header("Content-Disposition", "attachment; filename="+name)
	//浏览器下载或预览
	ctx.Header("Content-Disposition", "inline;filename="+name)
	ctx.Header("Content-Transfer-Encoding", "binary")
	ctx.File(filePath + name)
}

func base64Encode(src []byte) []byte {
	return []byte(base64.StdEncoding.EncodeToString(src))
}

func base64Decode(src []byte) ([]byte, error) {
	return base64.StdEncoding.DecodeString(string(src))
}
