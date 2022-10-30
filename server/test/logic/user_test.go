package logic

import (
	"server/logic"
	"testing"
)

func TestLogin(t *testing.T) {
	BeforeAll()
	logic.Login("1321321", "erwewr")
}
