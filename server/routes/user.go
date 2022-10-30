package routes

import (
	"github.com/gin-gonic/gin"
	"server/logic"
	"server/models/bind"
)

//注册所有路由
func registerUser(g *gin.RouterGroup) {
	g.POST("/register", Handler(register))
	g.POST("/login", Handler(login))
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
