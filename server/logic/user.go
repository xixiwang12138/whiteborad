package logic

import (
	"server/common/jwt"
	"server/dao"
	"server/models/bind"
)

// Register 注册业务，返回用户的ID
func Register(phone string, password string) (*bind.LoginResponse, error) {
	uId, err := dao.UserRepo.Init(phone, password)
	if err != nil {
		return nil, err
	}
	//注册之后直接登录生成JWT
	token, err := jwt.CreateJWT(uId)
	if err != nil {
		return nil, err
	}
	r := &bind.LoginResponse{
		Token: token,
		ID:    uId,
	}
	return r, nil
}

func Login(phone string, password string) (*bind.LoginResponse, error) {
	one, err := dao.UserRepo.FindOne(map[string]interface{}{
		"Phone":    phone,
		"Password": password,
	})
	if err != nil {
		return nil, err
	}
	if one == nil {
		//判断是没有注册还是密码错误
		one2, err := dao.UserRepo.FindOne(map[string]interface{}{
			"Phone": phone,
		})
		if err != nil {
			return nil, err
		}
		if one2 == nil {
			//TODO 该号码没有注册
			return nil, err
		}
		//TODO 密码错误
		return nil, err
	}
	//登录生成JWT
	token, err := jwt.CreateJWT(one.ID)
	if err != nil {
		return nil, err
	}
	r := &bind.LoginResponse{
		Token: token,
		ID:    one.ID,
	}
	return r, nil
}
