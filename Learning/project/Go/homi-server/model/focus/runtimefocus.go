package focus

//该对象只存在与缓存中
import (
	"time"
)

const OverdueTime int64 = 60 * 60 * 1000 // 过期时间（60分钟）

type RuntimeFocus struct {
	// TODO 可能需要一个主键作为唯一标识
	ElapseTime   int    `json:"elapseTime"`
	RealTime     int    `json:"realTime"`
	IsDown       bool   `json:"isDown"`
	InvalidTime  int    `json:"invalidTime"`
	InvalidCount int    `json:"invalidCount"`
	LastTime     int64  `json:"lastTime"`
	Focus        *Focus `json:"focus"` //TODO 所属的Focus对象

	// TODO MotionRecord 触发的动作记录

}

func NewRuntimeFocus(focus *Focus) *RuntimeFocus {
	if focus == nil {
		return nil
	}
	return &RuntimeFocus{Focus: focus}
}

func (u RuntimeFocus) IsOverdue() bool {
	return u.LastTime != 0 && (time.Now().UnixMilli()-u.LastTime > OverdueTime)
}

func (u RuntimeFocus) Get() data.BaseRepo {
	//TODO implement me
	panic("implement me")
}

func (u RuntimeFocus) Save() {
	//TODO implement me
	panic("implement me")
}

func (u RuntimeFocus) Delete() {
	//TODO implement me
	panic("implement me")
}

func (u RuntimeFocus) GetFromCache() data.BaseRepo {
	err := data.GetObjectFromCache(opr.RedisOpr, u.GetCacheKey(), &u)
	if err != nil {
		//TODO 未获取到也会报错
		return nil
	}
	return u
}

func (u RuntimeFocus) SaveToCache() {
	expiredTime := u.Focus.Duration/1000 + 10
	data.SaveObjectToCache(opr.RedisOpr, u, time.Duration(expiredTime))
}

func (u RuntimeFocus) DeleteInCache() {
	data.DeleteInCache(opr.RedisOpr, u.GetCacheKey())
}

func (u RuntimeFocus) GetCondition() interface{} {
	//TODO implement me
	panic("implement me")
}

func (u RuntimeFocus) IsCache() bool {
	return true
}

func (u RuntimeFocus) IsDB() bool {
	return false
}

func (u RuntimeFocus) Serializable() bool {
	return true
}

func (u RuntimeFocus) GetCacheKey() string { //TODO 修改缓存键
	return "runtime_focus:" + u.Focus.Openid
}

func (u RuntimeFocus) Update(newRuntimeData *RuntimeFocus) {
	u.ElapseTime = newRuntimeData.ElapseTime
	u.RealTime = newRuntimeData.RealTime
	u.IsDown = newRuntimeData.IsDown
	u.InvalidCount = newRuntimeData.InvalidCount

	//TODO 触发动作

	u.LastTime = time.Now().UnixMilli()
	u.SaveToCache()
}

func GetRuntime(openid string) (*RuntimeFocus, error) {
	dest := &RuntimeFocus{
		Focus: &Focus{Openid: openid},
	}
	err := data.GetObjectFromCache(opr.RedisOpr, dest.GetCacheKey(), dest)
	if err != nil {
		return nil, err
	}
	return dest, nil
}

func UpdateRuntime(openid string, runtime *RuntimeFocus) error {
	before, err := GetRuntime(openid)
	if err != nil {
		return err
	}
	before.Update(runtime)
	return nil
}
