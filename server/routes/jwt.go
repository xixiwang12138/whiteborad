package routes

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"server/common/config"
	"time"
)

type JWT struct {
	SigningKey []byte
}

func CreateJWT(openid string) (string, error) {
	j := NewJWT()
	cs := CustomClaims{
		Openid: openid,
		StandardClaims: jwt.StandardClaims{
			NotBefore: time.Now().Unix(),
			ExpiresAt: time.Now().Unix() + 60*60*60*4, //token -->45分钟
			Issuer:    "test",
		},
	}
	res, err := j.CreateToken(cs)
	if err != nil {
		return "", err
	}
	return res, nil
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
	signedString, err := token.SignedString(j.SigningKey)
	if err != nil {
		return "", errors.Wrap(err, "create token err: "+claims.Openid)
	}
	return signedString, nil
}

// ParseToken 解析 token
func (j *JWT) ParseToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (i interface{}, e error) {
		return j.SigningKey, nil
	})
	if err != nil {
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorMalformed != 0 {
				return nil, errors.New("failed parse")
			} else if ve.Errors&jwt.ValidationErrorExpired != 0 {
				// Token is expired
				return nil, errors.New("token has expired")
			} else if ve.Errors&jwt.ValidationErrorNotValidYet != 0 {
				return nil, errors.New("invalid token")
			} else {
				return nil, errors.New("invalid token")
			}
		}
	}
	if token != nil {
		if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
			return claims, nil
		}
		return nil, errors.New("invalid token")
	} else {
		return nil, errors.New("invalid token")
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
	return "", errors.New("invalid token")
}

func JWTAuth(config *config.BaseApiConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		if config.ExceptAuth[c.FullPath()] {
			c.Next()
			return
		}
		// 我们这里jwt鉴权取头部信息 x-token 登录时回返回token信息 这里前端需要把token存储到cookie或者本地localSstorage中 不过需要跟后端协商过期时间 可以约定刷新令牌或者重新登录
		token := c.Request.Header.Get("token")
		if token == "" {
			Err(c, 403, 100003, "登录凭证解析错误")
			c.Abort()
			return
		}
		j := NewJWT()
		// parseToken 解析token包含的信息
		claims, err := j.ParseToken(token)
		if err != nil {
			Err(c, 403, 100003, "登录凭证解析错误")
			c.Abort()
			return
		}
		// gin的上下文记录claims和userId的值
		c.Set("payload", claims)
		c.Next()
	}
}

func getOpenid(c *gin.Context) string {
	cc, _ := c.Get("payload")
	return cc.(*CustomClaims).Openid
}
