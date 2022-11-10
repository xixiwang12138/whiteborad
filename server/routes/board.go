package routes

import (
	"errors"
	"github.com/gin-gonic/gin"
	"log"
	"server/common/cts"
	"server/dao"
	"server/logic"
	"server/models"
	"server/models/bind"
)

//注册所有路由
func registerBoard(g *gin.RouterGroup) {
	g.GET("/boards", NoParamHandler(getCreatedBoards))
	g.GET("/boards/joined", NoParamHandler(getJoinedBoards))
	//g.GET("/boardPages", Handler(getPages))
	g.POST("/board", Handler(createBoard))
	g.POST("/join", Handler(joinBoard))
}

// getCreatedBoards 查询用户创建的所有的Board
func getCreatedBoards(ctx *gin.Context) (interface{}, error) {
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

func getJoinedBoards(ctx *gin.Context) (interface{}, error) {
	userId := GetUser(ctx)
	boards, err := dao.UserJoinRepo.GetUserJoins(userId)
	if err != nil {
		return nil, err
	}
	return struct {
		Boards interface{} `json:"boards"`
	}{
		boards,
	}, nil
}

//// getPages 查询一个board中所有的pageId
//func getPages(ctx *gin.Context, req *bind.BoardReq) (interface{}, error) {
//	bId := req.BoardId
//	pages, err := logic.GetBoardPages(bId)
//	if err != nil {
//		return nil, err
//	}
//	return struct {
//		Pages interface{} `json:"pages"`
//	}{
//		pages,
//	}, nil
//}

func createBoard(ctx *gin.Context, req *bind.BoardReq) (interface{}, error) {
	uId := GetUser(ctx)
	bName := req.BoardName
	bId, err := dao.WhiteBoardRepo.Init(uId, bName)
	if err != nil {
		log.Printf(cts.ErrorFormat, err)
		return nil, err
	}
	return struct {
		BoardId string `json:"boardId"`
	}{
		bId,
	}, nil
}

func joinBoard(ctx *gin.Context, req *bind.BoardReq) (interface{}, error) {
	uId := GetUser(ctx)
	bId := req.BoardId
	res, err := dao.WhiteBoardRepo.FindByID(bId)
	if err != nil {
		return nil, err
	}
	if res == nil {
		return nil, errors.New("no such board")
	}
	err = dao.UserJoinRepo.Join(uId, bId)
	if err != nil {
		return nil, err
	}
	pages, err := dao.PageRepo.GetBoardPages(bId)
	if err != nil {
		return nil, err
	}
	res.Pages = pages
	return struct {
		Board *models.WhiteBoard `json:"board"`
	}{
		res,
	}, nil
}
