package utils

import (
	"github.com/bwmarrin/snowflake"
	"strconv"
)

var node *snowflake.Node

func init() {
	nodeNew, err := snowflake.NewNode(432)
	if err != nil {
		panic(err)
	}
	node = nodeNew
}

func GenerateId() string {
	// Generate a snowflake ID.
	return strconv.FormatInt(int64(node.Generate()), 10)
}
