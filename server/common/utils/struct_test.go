package utils

import (
	"fmt"
	"homi-server/common/cts"
	"testing"
	"time"
)

func TestRandomString(t *testing.T) {
	//for i := 0; i < 7; i++ {
	//	fmt.Println(RandomString(10))
	//	time.Sleep(time.Second * 2)
	//}
	res := RandomStringUsingChars(8, "这是一个中文aaaaaaaaaaaaaaaa")
	fmt.Println(res)
}

func TestSet(t *testing.T) {
	set := Set[string]{}
	set.Add("32323")
	all := set.All()
	fmt.Println(all)
	s, _ := set.Poll()
	all = set.All()
	fmt.Println(s)

	set.Add("1232")
	r := set.Contains("1232")
	r2 := set.Contains("23")
	fmt.Println(r, r2)

	set.Remove("1232")
	if set.Empty() {
		fmt.Println("11")
	}
	_, f := set.Poll()
	fmt.Println(f)
}

func TestTimer(t *testing.T) {
	for i := 0; i < 19; i++ {
		SetAsynchronousTask(time.Now().UnixMilli()+10*1000, func() {
			fmt.Println("执行成功")
		})
	}
	//SetAsynchronousTask(time.Now().UnixMilli()+10*1000, func() {
	//	fmt.Println("执行成功")
	//})

	fmt.Println("hhhhhhhhh")
	time.Sleep(time.Duration(cts.NoToSeconds * 12))
}

type Player struct {
	Description string `json:"description,omitempty"`
	Exp         int    `json:"exp,omitempty"`
	Score       int    `json:"score,omitempty"`
	InviteCode  string `json:"inviteCode,omitempty"`
	Gold        int    `json:"gold,omitempty"`
	CreateTime  int    `json:"createTime,omitempty"`
	State       int    `json:"state,omitempty"`
	StateTime   int    `json:"stateTime,omitempty"`
	StateDesc   string `json:"stateDesc,omitempty"`
}

func TestSliceFind(t *testing.T) {
	d := Player{
		Description: "jjjjjjjjjjjjj",
		Exp:         45435,
		Score:       034543,
		InviteCode:  "fdsjhfkds",
		Gold:        0,
		CreateTime:  950,
		State:       0,
		StateTime:   4732894723,
		StateDesc:   "",
	}

	s := Serialize[Player](d)
	fmt.Println(s)

	p := Deserialize[Player](s)
	fmt.Println(p)
}
