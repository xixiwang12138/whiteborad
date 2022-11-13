package bind

import "server/models"

type LoginResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"` //用户的ID
}

type LoginReq struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}
