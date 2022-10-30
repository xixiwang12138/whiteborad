package logic

import (
	"fmt"
	"server/common/repo"
	"server/dao"
	"server/logic"
	"testing"
)

func TestLogin(t *testing.T) {
	BeforeAll()
	logic.Login("1321321", "erwewr")
}

func TestFind(t *testing.T) {
	BeforeAll()
	find, err := dao.UserRepo.Find(map[string]interface{}{
		"phone": "1321321",
	}, repo.Condition{
		Filed: "id",
		Opr:   ">",
		Value: "9999999",
	}, repo.Condition{
		Filed: "password",
		Opr:   "=",
		Value: "erwewr",
	})
	if err != nil {
		return
	}
	fmt.Println(find)
}
