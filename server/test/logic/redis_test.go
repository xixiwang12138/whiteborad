package logic

import (
	"fmt"
	"reflect"
	"server/common/config"
	"server/common/sources"
	"server/common/utils"
	"testing"
)

func BeforeRedis() {
	sources.RedisSource.Setup(&config.Config{RedisConfig: &config.RedisConfig{
		Addr:     "175.178.81.93:6379",
		Password: "L2q81sNBKFKFW23y",
		DB:       0,
	}})
}

func TestRedis(t *testing.T) {
	BeforeRedis()
	result, err := sources.RedisSource.Client.HGetAll("t_token").Result()
	if err != nil {
		return
	}

	for _, r := range result {
		fmt.Println(reflect.TypeOf(r).String()) //MGET获得的数据为string
	}
}

type M struct {
	A int64   `json:"a"`
	B string  `json:"b"`
	C float64 `json:"c"`
	D bool    `json:"d"`
	E int     `json:"e"`
}

func (m *M) Print() {
	fmt.Println(m.E)
}

type I interface {
	Print()
}

func TestRedisGetAll(t *testing.T) {
	m := map[string]string{
		"a": "12",
		"b": "xixi",
		"c": "432.43243",
		"d": "true",
		"e": "898978",
	}
	//
	//marshal, err := json.Marshal(m)
	//fmt.Println(string(marshal))
	//if err != nil {
	//	return
	//}
	//x := &M{}
	//err = json.Unmarshal(marshal, x)
	//if err != nil {
	//	panic(err)
	//}
	//fmt.Println(reflect.TypeOf(x.A))

	p := new(I)
	utils.StringMap2Struct(m, p)
	fmt.Println(p)
}

func MakeStruct(args ...any) reflect.Value {
	var sfs []reflect.StructField
	for k, v := range args {
		typ := reflect.TypeOf(v)
		structFiled := reflect.StructField{Name: fmt.Sprintf("F%d", k+1), Type: typ}
		sfs = append(sfs, structFiled)
	}

	st := reflect.StructOf(sfs)
	so := reflect.New(st)
	return so
}

func TestMakeStruct(t *testing.T) {
	s := MakeStruct(1, "2", 543)
	s.String()
}
