package config

import (
	"gopkg.in/yaml.v2"
	"log"
)

const (
	CertFile = "server.crt"
	KeyFile  = "server.key"
)

// LogConfig 日志配置
const LogConfig = log.Lshortfile | log.Lmicroseconds | log.Ldate

type MachineConfig struct {
	DatacenterID int64 `yaml:"datacenterID"`
	WorkerID     int64 `yaml:"workerID"`
}

// MySQLConfig MySQL配置信息
type MySQLConfig struct {
	UserName string `yaml:"userName"`
	Password string `yaml:"password"`
	Address  string `yaml:"address"`
	Port     string `yaml:"port"`
	DbName   string `yaml:"dbName"`
}

// RedisConfig Redis配置信息，注意字段名与Options保持一致
type RedisConfig struct {
	Addr     string `yaml:"address"`
	Password string `yaml:"password"`
	DB       int    `yaml:"DB"`
}

// Config 所有配置信息集合
type Config struct {
	MysqlConfig     *MySQLConfig     `yaml:"mysql"`
	HTTPConfig      *BaseApiConfig   `yaml:"http"`
	RedisConfig     *RedisConfig     `yaml:"redis"`
	WebSocketConfig *WebSocketConfig `yaml:"websocket"`
}

// BaseApiConfig web层配置信息
type BaseApiConfig struct {
	PORT       string          `yaml:"port"`
	ExceptAuth map[string]bool //鉴权豁免路由，注意这个不在配置文件内配置
}

type WebSocketConfig struct {
	PORT string `yaml:"port"`
}

func (c *Config) GetConfig(yamlString string) {
	yamlFile := []byte(yamlString)
	err := yaml.Unmarshal(yamlFile, c)
	if err != nil {
		log.Fatalf("[Get Config]Unmarshal Yaml: %v", err)
	}
}
