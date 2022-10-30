package err

import (
	"encoding/json"
)

type ErrorCode int

// BusinessError 业务错误类型
type BusinessError struct {
	Status int    // http状态码
	Msg    string // 错误信息
}

//用于创建错误定义，均为字符串

var (
	Code2SessionError   = ConstructErr(403, 200001, "获取openid错误")
	GetPhoneNumberError = ConstructErr(403, 200002, "获取手机号错误")
	GetAccessTokenError = ConstructErr(403, 200003, "获取手机号错误")
)

var (
	UserLoginErr = ConstructErr(403, 100001, "用户身份状态异常")
)

var (
	InvalidTokenError   = ConstructErr(403, 100001, "登录状态异常")
	IncorrectLoginError = ConstructErr(403, 100002, "该账号未正确登录")
	TokenVerifyError    = ConstructErr(403, 100003, "登录凭证解析错误")
	UpdateTokenError    = ConstructErr(200, 100004, "登录凭证更新失败")
	NotAuthorizedError  = ConstructErr(403, 100005, "没有权限进行本次操作")
	InterfaceNotFound   = ConstructErr(404, 100006, "Not Found")
)

var (
	RedisInsertError = ConstructErr(500, 200001, "Redis添加数据错误")
	RedisDeleteError = ConstructErr(500, 200001, "Redis删除数据错误")
	RedisQueryError  = ConstructErr(500, 200001, "Redis查询数据错误")
	RedisUpdateError = ConstructErr(500, 200001, "Redis更新数据错误")
)

var (
	UpdateUserError = ConstructErr(500, 40001, "更新用户信息错误")
)

var (
	GetFocusingSetErr   = ConstructErr(500, 50001, "获取专注中玩家集合错误")
	ConnectFocusingErr  = ConstructErr(500, 50002, "获取与房间的连接失败")
	StartFocusingErr    = ConstructErr(500, 50003, "开始专注失败")
	ContinueFocusingErr = ConstructErr(500, 50004, "继续专注失败,当前用户无正在专注的任务")
	NoFocusingErr       = ConstructErr(500, 50005, "当前用户无正在专注的任务")
	EndFocusingErr2     = ConstructErr(500, 50006, "专注时长不足")
)

var (
	NoRoomErr        = ConstructErr(500, 60001, "没有指定房间")
	HasBoughtRoomErr = ConstructErr(500, 60002, "你已经购买该房间")
)

var (
	HasNotRoomErr  = ConstructErr(500, 70001, "您尚未该购买皮肤")
	CollectRoomErr = ConstructErr(500, 70002, "不能收藏自己的房间")
)

// ConstructErr 用于构造异常序列化
func ConstructErr(httpCode, Code int, errInfo string) string {
	e := Exception{
		HttpCode: httpCode,
		Code:     Code,
		Error:    errInfo,
	}
	v, _ := json.Marshal(e)
	return string(v)
}

// Exception 一般不用于序列化
type Exception struct {
	HttpCode int
	Code     int
	Error    string
}
