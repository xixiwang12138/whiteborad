package auth

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"homi-server/common/api"
	"time"
)

type JWT struct {
	SigningKey []byte
}

var (
	InvalidTokenError   = api.ConstructErr(403, 100001, "登录状态异常")
	IncorrectLoginError = api.ConstructErr(403, 100002, "该账号未正确登录")
	TokenVerifyError    = api.ConstructErr(403, 100003, "登录凭证解析错误")
	UpdateTokenError    = api.ConstructErr(200, 100004, "登录凭证更新失败")
	NotAuthorizedError  = api.ConstructErr(403, 100005, "没有权限进行本次操作")
	InterfaceNotFound   = api.ConstructErr(404, 100006, "Not Found")
)

func CreateJWT(openid string) string {
	j := NewJWT()
	cs := CustomClaims{
		Openid: openid,
		StandardClaims: jwt.StandardClaims{
			NotBefore: time.Now().Unix(),
			// TODO 设置token过期时间
			ExpiresAt: time.Now().Unix() + 60*60*45, //token -->45分钟
			Issuer:    "test",
		},
	}
	res, err := j.CreateToken(cs)
	if err != nil {
		panic(UpdateTokenError)
	}
	//TODO 将token存入Redis
	return res
}

type CustomClaims struct {
	Openid string
	jwt.StandardClaims
}

func NewJWT() *JWT {
	return &JWT{
		[]byte("this is sign key"),
	}
}

// CreateToken 创建一个token
func (j *JWT) CreateToken(claims CustomClaims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.SigningKey)
}

// ParseToken 解析 token
func (j *JWT) ParseToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (i interface{}, e error) {
		return j.SigningKey, nil
	})
	if err != nil {
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorMalformed != 0 {
				panic(TokenVerifyError)
			} else if ve.Errors&jwt.ValidationErrorExpired != 0 {
				// Token is expired
				panic(InvalidTokenError)
			} else if ve.Errors&jwt.ValidationErrorNotValidYet != 0 {
				panic(InvalidTokenError)
			} else {
				panic(InvalidTokenError)
			}
		}
	}
	if token != nil {
		if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
			return claims, nil
		}
		panic(InvalidTokenError)
	} else {
		panic(InvalidTokenError)
	}

}

// RefreshToken 更新token
func (j *JWT) RefreshToken(tokenString string) (string, error) {
	jwt.TimeFunc = func() time.Time {
		return time.Unix(0, 0)
	}
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return j.SigningKey, nil
	})
	if err != nil {
		return "", err
	}
	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		jwt.TimeFunc = time.Now
		claims.StandardClaims.ExpiresAt = time.Now().Add(45 * time.Minute).Unix()
		return j.CreateToken(*claims)
	}
	panic(UpdateTokenError)
}

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 我们这里jwt鉴权取头部信息 x-token 登录时回返回token信息 这里前端需要把token存储到cookie或者本地localSstorage中 不过需要跟后端协商过期时间 可以约定刷新令牌或者重新登录
		token := c.Request.Header.Get("token")
		if token == "" {
			api.Err(c, 403, 100003, "登录凭证解析错误")
			c.Abort()
			return
		}
		j := NewJWT()
		// parseToken 解析token包含的信息
		claims, _ := j.ParseToken(token)
		// gin的上下文记录claims和userId的值
		c.Set("payload", claims)
		c.Next()
	}
}
