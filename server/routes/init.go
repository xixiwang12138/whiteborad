package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/unrolled/secure"
	"log"
	"net/http"
	"runtime"
	c "server/common/config"
	"server/common/jwt"
	"server/common/utils"
)

func InitAppGateway(config *c.BaseApiConfig) {
	g := InitGin(config)
	//注册路由组
	BoardRouter := g.Group("/api/board")
	UserRouter := g.Group("/api/user")
	PageRouter := g.Group("/api/page")

	config.ExceptAuth = make(map[string]bool, 0)
	config.ExceptAuth["/api/user/login"] = true
	config.ExceptAuth["/api/user/reset"] = true
	config.ExceptAuth["/api/user/register"] = true

	registerBoard(BoardRouter)
	registerUser(UserRouter)
	registerPage(PageRouter)
	//HTTPS启动
	if utils.ExistFile(c.KeyFile) && utils.ExistFile(c.CertFile) {
		g.Use(TlsHandler(config.PORT))
		log.Println("[HTTPS] HTTPS启动成功")
		if err := g.RunTLS(config.PORT, c.CertFile, c.KeyFile); err != nil {
			panic(err)
		}
	} else {
		log.Println("[HTTPS] CERT FILE NOT EXIST, 已使用HTTP代替: ", config.PORT)
		if err := g.Run(config.PORT); err != nil {
			panic(err)
		}
	}
}

func InitGin(config *c.BaseApiConfig) *gin.Engine {
	g := gin.Default()
	g.Use(CatchError()) //全局异常处理中间件
	g.Use(JWTAuth(config))
	return g
}

// Success 返回成功
func Success(c *gin.Context, data interface{}) {
	var resp struct {
		Code int32       `json:"code"`
		Data interface{} `json:"data"`
	}
	resp.Data = data
	resp.Code = 0
	c.JSON(http.StatusOK, resp)
	return
}

// Err 返回失败
func Err(c *gin.Context, httpCode int, code int, msg string) {
	c.JSON(httpCode, map[string]interface{}{
		"code":  code,
		"error": msg, //错误提示
	})
	return
}

// CatchError 异常捕获中间件
func CatchError() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				url := c.Request.URL
				method := c.Request.Method
				log.Printf("| url [%s] | method | [%s] | error [%s] |", url, method, err)
				//var exception err.Exception
				////判断是否为自定义异常
				//switch err.(type) {
				//case string: //自定义异常
				//	err := json.Unmarshal([]byte(string(err.(string))), &exception)
				//	if err != nil {
				//		Err(c, http.StatusBadRequest, exception.Code, "未知错误，请联系管理员！")
				//		c.Abort()
				//		return
				//	}
				//	Err(c, exception.HttpCode, exception.Code, exception.Error)
				//default:
				Err(c, 500, 1, err.(runtime.Error).Error())
				//}
				c.Abort()
			}
		}()
		c.Next()
	}
}

func processResponse(ctx *gin.Context, err error, res any) {
	if err == nil {
		ctx.JSON(http.StatusOK, gin.H{
			"code": 0,
			"data": res,
		})
	} else {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":  -1,
			"error": err.Error(),
		})
	}
}

// Handler 不需要openid的handler包裹器
func Handler[P any, R any](rawFunc func(*gin.Context, *P) (R, error)) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		param := new(P)
		var res any
		var err error
		if err = ctx.ShouldBind(param); err == nil {
			res, err = rawFunc(ctx, param)
		}
		processResponse(ctx, err, res)
	}
}

// NoParamHandler 无参handler包裹器
func NoParamHandler[R any](rawFunc func(*gin.Context) (R, error)) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var res any
		var err error
		res, err = rawFunc(ctx)
		processResponse(ctx, err, res)
	}
}

func TlsHandler(port string) gin.HandlerFunc {
	return func(c *gin.Context) {
		secureMiddleware := secure.New(secure.Options{
			SSLRedirect: true,
			SSLHost:     port,
		})
		err := secureMiddleware.Process(c.Writer, c.Request)
		// If there was an error, do not continue.
		if err != nil {
			return
		}
		c.Next()
	}
}

func JWTAuth(config *c.BaseApiConfig) gin.HandlerFunc {
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
		j := jwt.NewJWT()
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

func GetUser(ctx *gin.Context) int64 {
	data, ok := ctx.Get("payload")
	if !ok {
		return 0
	}
	p := data.(jwt.CustomClaims)
	return p.UserId
}
