package tests

import (
	"fmt"
	"homi-server/service/bot/logic"
	"testing"
)

func TestName(t *testing.T) {
	for i := 0; i < 432; i++ {
		fmt.Println(bots.IntervalRandomPick("2-8"))
	}
}
