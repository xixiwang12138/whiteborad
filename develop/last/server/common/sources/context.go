package sources

import "server/common/config"

var DataSourceContext = &dataSourceContext{}

type IDataSource interface {
	Setup(config *config.Config) // 数据库初始化接口
	Close()                      // 关闭连接接口
	ConfigAvailable(config *config.Config) bool
}

type dataSourceContext struct {
	sources []IDataSource
}

func (this *dataSourceContext) RegisterSource(source IDataSource) {
	this.sources = append(this.sources, source)
}

func (this *dataSourceContext) SetupSources(config *config.Config) {
	for _, source := range this.sources {
		if source.ConfigAvailable(config) {
			source.Setup(config)
		}
	}
}
