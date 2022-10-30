package models

type User struct {
	ID int64 `json:"id"`
	//Name     string `json:"name"`
	Phone    string `json:"phone"`
	Password string `json:"password"` //密码先暂时密文存储，后续有时间采用加密
}
