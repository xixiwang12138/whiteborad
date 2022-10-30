package bind

type LoginResponse struct {
	Token string `json:"token"`
	ID    int64  `json:"id"` //用户的ID
}

type LoginReq struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}
