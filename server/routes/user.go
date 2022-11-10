package routes

import (
	"github.com/gin-gonic/gin"
	"log"
	"server/common/cts"
	"server/dao"
	"server/logic"
	"server/models/bind"
)

//注册所有路由
func registerUser(g *gin.RouterGroup) {
	g.POST("/register", Handler(register))
	g.POST("/login", Handler(login))
	g.POST("/reset", Handler(reset))
	g.GET("/info", NoParamHandler(info))
}

func register(_ *gin.Context, req *bind.LoginReq) (*bind.LoginResponse, error) {
	response, err := logic.Register(req.Phone, req.Password)
	if err != nil {
		return nil, err
	}
	return response, err
}

func login(_ *gin.Context, req *bind.LoginReq) (*bind.LoginResponse, error) {
	response, err := logic.Login(req.Phone, req.Password)
	if err != nil {
		return nil, err
	}
	return response, err
}

func reset(_ *gin.Context, req *bind.LoginReq) (interface{}, error) {
	err := logic.Reset(req.Phone, req.Password)
	return nil, err
}

func info(ctx *gin.Context) (interface{}, error) {
	userId := GetUser(ctx)
	user, err := dao.UserRepo.FindByID(userId)
	if err != nil {
		log.Printf(cts.ErrorFormat, err)
		return nil, err
	}
	return struct {
		User any `json:"user"`
	}{user}, nil
}
