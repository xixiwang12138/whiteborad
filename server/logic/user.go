package logic

import (
	"server/common/jwt"
	"server/dao"
	"server/models/bind"
)

// Register 注册业务，返回用户的ID
func Register(phone string, password string) (*bind.LoginResponse, error) {
	f, err := userExist(phone)
	if err != nil {
		return nil, err
	}
	if f {
		//TODO 该号码已经注册
		return nil, err
	}
	uId, err := dao.UserRepo.Init(phone, password)
	if err != nil {
		return nil, err
	}
	//注册之后自动生成一个白板
	_, _, err = InitBoard(uId)
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
		f, err := userExist(phone)
		if err != nil {
			return nil, err
		}
		if !f {
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

func userExist(phone string) (bool, error) {
	one, err := dao.UserRepo.FindOne(map[string]interface{}{
		"Phone": phone,
	})
	if err != nil {
		return false, err
	}
	if one == nil {
		return false, nil
	}
	return true, nil
}
