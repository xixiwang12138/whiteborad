package jwt

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"time"
)

type JWT struct {
	SigningKey []byte
}

func CreateJWT(userId string) (string, error) {
	j := NewJWT()
	cs := CustomClaims{
		UserId: userId,
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
	UserId string
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
		return "", errors.Wrap(err, "create token err: "+claims.UserId)
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

func getOpenid(c *gin.Context) string {
	cc, _ := c.Get("payload")
	return cc.(*CustomClaims).UserId
}
