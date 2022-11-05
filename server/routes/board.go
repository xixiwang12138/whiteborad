package routes

import (
	"github.com/gin-gonic/gin"
	"server/logic"
	"server/models/bind"
)

//注册所有路由
func registerBoard(g *gin.RouterGroup) {
	g.GET("/boards", NoParamHandler(GetBoards))
	g.GET("/boardPages", Handler(GetPages))
}

func GetBoards(ctx *gin.Context) (interface{}, error) {
	userId := GetUser(ctx)
	boards, err := logic.GetBoards(userId)
	if err != nil {
		return nil, err
	}
	return struct {
		Boards interface{} `json:"boards"`
	}{
		boards,
	}, nil
}

// GetPages 查询一个board中所有的pageId
func GetPages(ctx *gin.Context, req *bind.BoardReq) (interface{}, error) {
	bId := req.BoardId
	pages, err := logic.GetBoardPages(bId)
	if err != nil {
		return nil, err
	}
	return struct {
		Pages interface{} `json:"pages"`
	}{
		pages,
	}, nil
}
