package config

import "log"

var (
	NormalLogger log.Logger
)

func LoginConfig() {
	log.SetFlags(log.Lshortfile | log.Lmicroseconds | log.Ldate)
}
