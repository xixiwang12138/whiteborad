package main

import (
	"server/common/config"
	"server/common/sources"
	"server/routes"
	"server/ws"
)

func main() {
	fmt.Println("starting")
	config.SetupConfig("./config.yaml")
	sources.DataSourceContext.SetupSources(config.GlobalConfig)
	go ws.StartUp(config.GlobalConfig.WebSocketConfig)
	routes.InitAppGateway(config.GlobalConfig.HTTPConfig)
}
