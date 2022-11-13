package test

import (
	"encoding/json"
	"fmt"
	"reflect"
	"testing"
)

type A struct {
	B interface{} `json:"b"`
}

type BType struct {
	C string `json:"c"`
	D int    `json:"d"`
}

func TestJSON(t *testing.T) {
	b := &BType{
		C: "54353",
		D: 5435,
	}
	a := &A{B: b}

	bytes, err := json.Marshal(a)
	if err != nil {
		return
	}

	fmt.Println(string(bytes)) //{"b":{"c":"54353","d":5435}}
}

//注意！！！！！！！ ==============================================> 在一个结构体中any类型的字段反序列化JSON为  map[string]any
func TestUnJSON(t *testing.T) {
	a := new(A)
	err := json.Unmarshal([]byte("{\"b\":{\"c\":\"54353\",\"d\":5435}}"), a)
	if err != nil {
		return
	}
	fmt.Println(reflect.TypeOf(a.B).String()) //输出：map[string]interface{}
	//BV := a.B.(BType) //这里会panic
	//fmt.Println(BV.C)
}

func TestJson2(t *testing.T) {
	a := make(map[string]string)
	s := "{\"c\":\"54353\",\"d\":\"5435\"}"
	err := json.Unmarshal([]byte(s), &a)
	if err != nil {
		panic(err)
		return
	}
	fmt.Println(a)
}
