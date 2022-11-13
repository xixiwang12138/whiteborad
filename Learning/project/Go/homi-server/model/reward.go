package data

import (
	"math"
)

type RewardType int8

const (
	GoldReward RewardType = iota
	ExpReward
	RoomSkinReward
	RoomStarReward
	MotionReward
	ScoreReward
)

type Bonus struct {
	Rate float64 `json:"rate" bson:"rate"`
	Val  float64 `json:"val" bson:"val"`
}

type Reward struct {
	Type     RewardType  `json:"type" bson:"type"`
	Value    float64     `json:"value" bson:"value"`
	Bonus    Bonus       `json:"bonus" bson:"bonus"`
	Params   interface{} `json:"params" bson:"params"` ///暂时没有作用
	Receiver string      `json:"receiver" bson:"receiver"`
}

func NewReward(type1 RewardType, value float64, rec string) *Reward {
	return &Reward{Type: type1, Value: value, Receiver: rec}
}

func (r Reward) RealValue() float64 {
	rate := 0.0
	if r.Bonus.Rate != 0.0 {
		rate = r.Bonus.Rate
	}
	bVal := 0.0
	if r.Bonus.Val != 0.0 {
		bVal = r.Bonus.Val
	}
	return math.Round(r.Value*(rate+1) + bVal)
}

func (r *Reward) BonusUp(rate float64, val float64) {
	r.Bonus.Val += val
	r.Bonus.Rate += rate
}

//// region 奖励Group处理
//
//type RewardGroup struct {
//	Rewards []*Reward `json:"rewards" bson:"rewards"`
//}
//
//func CreateRewardGroup(rs ...*Reward) *RewardGroup {
//	if rs == nil || len(rs) == 0 {
//		return &RewardGroup{Rewards: make([]*Reward, 0)}
//	}
//	res := &RewardGroup{rs}
//	return res
//}
//
//func (r *RewardGroup) Add(rs ...*Reward) {
//	if rs == nil || len(rs) == 0 {
//		return
//	}
//	for _, v := range rs {
//		r.Rewards = append(r.Rewards, v)
//	}
//}
//
////endregion

//type RewardProcessor interface {
//	//PreProcess() error        //预处理
//	//Conditions() []*Condition //附带条件
//	//Check()                   //消耗
//
//	Invoke(rewardType RewardType) error            //进行处理
//}
//
