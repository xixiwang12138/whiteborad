package logic

import (
	"github.com/pkg/errors"
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
		return nil, errors.New("the phone has been registered")
	}
	u, err := dao.UserRepo.Init(phone, password)
	if err != nil {
		return nil, err
	}
	//注册之后自动生成一个白板
	err = InitBoard(u.ID)
	if err != nil {
		return nil, err
	}
	//注册之后直接登录生成JWT
	token, err := jwt.CreateJWT(u.ID)
	if err != nil {
		return nil, err
	}
	r := &bind.LoginResponse{
		Token: token,
		User:  u,
	}
	return r, nil
}

func Login(phone string, password string) (*bind.LoginResponse, error) {
	one, err := dao.UserRepo.FindOne(map[string]interface{}{
		"phone":    phone,
		"password": password,
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
			return nil, errors.New("phone is not registered")
		}
		return nil, errors.New("wrong password")
	}
	//登录生成JWT
	token, err := jwt.CreateJWT(one.ID)
	if err != nil {
		return nil, err
	}
	r := &bind.LoginResponse{
		Token: token,
		User:  one,
	}
	return r, nil
}

func Reset(phone string, newPassword string) error {
	user, err := dao.UserRepo.FindOne(map[string]interface{}{
		"phone": phone,
	})
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("phone is not registered")
	}
	return dao.UserRepo.Reset(user.ID, newPassword)
}

func userExist(phone string) (bool, error) {
	one, err := dao.UserRepo.FindOne(map[string]interface{}{
		"phone": phone,
	})
	if err != nil {
		return false, err
	}
	if one == nil {
		return false, nil
	}
	return true, nil
}
