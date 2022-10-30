package utils

import (
	"github.com/bwmarrin/snowflake"
)

var node *snowflake.Node

func init() {
	nodeNew, err := snowflake.NewNode(432)
	if err != nil {
		panic(err)
	}
	node = nodeNew
}

func GenerateId() int64 {
	// Generate a snowflake ID.
	return int64(node.Generate())
}
