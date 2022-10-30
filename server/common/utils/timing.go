package utils

import (
	"github.com/robfig/cron/v3"
	"homi-server/common/cts"
	"log"
	"time"
)

//定时任务

// SetAsynchronousTask 定时任务执行，ms为执行时刻的毫秒时间戳
func SetAsynchronousTask(ms int64, task func()) {
	timer := time.NewTimer(time.Duration((ms - time.Now().UnixMilli()) * cts.NoToMillSeconds))
	go func() {
		<-timer.C
		task()
	}()
}

var privateCron *cron.Cron

// SetTimingTask 设置周期性任务执行
func SetTimingTask(task func(), cronExpression string) { //每天凌晨两点进行任务
	if privateCron == nil {
		privateCron = cron.New()
	}
	//"0 2 * * *"
	_, err := privateCron.AddFunc(cronExpression, task)
	if err != nil {
		log.Println(err)
		return
	}
	privateCron.Start()
}

// TodayZeroUnix 获取当天的8点对应的时间戳 TODO 注意处理时区问题
func TodayZeroUnix() int64 {
	currentTime := time.Now()
	startTime := time.Date(currentTime.Year(), currentTime.Month(), currentTime.Day(), 0, 0, 0, 0, currentTime.Location()).Unix()
	return startTime
}

// TodayOneHour 获取今天Hour整点的时间戳
func TodayOneHour(hour int) int64 {
	z := TodayZeroUnix()
	return z + int64(hour)*cts.MillToHour
}
