package base

import (
	"errors"
	"homi-server-single/common/api"
	"homi-server-single/common/errs"
	"homi-server-single/models"
)

//TODO 抽象为interface?

// Register 找不到用户进行创建并初始化用户房间
func Register(lb *model.LoginBody) (*model.Player, error) {
	//注册业务
	//找不到用户就进行创建
	player, err := model.GetPlayer(lb.Openid)
	if err != nil {
		return nil, err
	}
	if player == nil {
		p, err := model.CreatPlayer(lb.Openid, lb.WxUserInfo)
		if err != nil {
			return nil, err
		}
		return p, nil
	}
	return player, nil
}

// Login 增加登录记录并签名
func Login(openid string) (string, error) {
	//在loginInfo中创建一条记录
	_, err := model.CreateLoginInfo(openid)
	if err != nil {
		return "", err
	}
	return api.CreateJWT(openid)
}

//Logout 退出登录
func Logout(openid string) error {
	return model.LogoutInfo(openid)
}

//func UseRewardCode(openid string, Code string) (*model.RewardCode, error) {
//	rewardCode, err := model.GetRewardCodeByCode(Code)
//	if err != nil {
//		return nil, err
//	}
//
//	now := time.Now().UnixMilli()
//
//	if rewardCode.StartTime != 0 && now < rewardCode.StartTime {
//		return nil, errors.New("该兑换码未开始！")
//	}
//	if rewardCode.EndTime != 0 && now > rewardCode.EndTime {
//		return nil, errors.New("该兑换码已过期！")
//	}
//	if rewardCode.State != model.RewardCodeStateNormal {
//		return nil, errors.New("该兑换码已失效！")
//	}
//
//	// TODO conditionGroup rewardGroup
//	rewardCode.Use(openid)
//
//	return rewardCode, nil
//}
//
//func GenerateRewardCodes(rewards []*data.Reward, conditions []*data.Condition, desc string, startTime int64, endTime int64, count int) (interface{}, error) {
//	type RewardCodeAll struct {
//		model.RewardCode
//		Conditions []*data.Condition `json:"conditions"`
//		Rewards    []*data.Reward    `json:"rewards"`
//	}
//	var rewardCodeList []*RewardCodeAll
//	if count == 0 {
//		count = 1
//	}
//	for i := 0; i < count; i++ {
//		randomCode := utils.RandomString(8)
//		rewardCode := &model.RewardCode{
//			Code:        randomCode,
//			Description: desc,
//			StartTime:   startTime,
//			EndTime:     endTime,
//			State:       model.RewardCodeStateNormal,
//		}
//		//先进行保存
//		rewardCode.Save()
//
//		//获取到ID
//		code, err := model.ConditionGetRewardCode(rewardCode)
//		id := code.ID_
//		if err != nil {
//			return nil, err
//		}
//
//		//保存rewards
//		if rewards != nil {
//			for _, v := range rewards {
//				v.RecordID = id
//			}
//			model.DbOpr.Create(rewards)
//		}
//
//		//conditions
//		if conditions != nil {
//			for _, v := range conditions {
//				v.RecordID = id
//			}
//			model.DbOpr.Create(conditions)
//		}
//
//		oneAns := &RewardCodeAll{}
//		copier.Copy(oneAns, rewardCode)
//		oneAns.Conditions = conditions
//		oneAns.Rewards = rewards
//		rewardCodeList = append(rewardCodeList, oneAns)
//	}
//	return rewardCodeList, nil
//}

func InvitePlayer(iCode, openid string) error {
	//playerById, err := GetPlayerByOpenid(openid)
	//playerByCode := &model.Player{}
	//model.DbOpr.Where("invite_code = ?", iCode).First(playerByCode)
	//if playerById.State != model.NewerPlayer {
	//	errors.New("无法邀请非新手玩家！")
	//}
	//if playerById.InviteCode != "" {
	//	//"无法重复邀请！"
	//	return errors.New("无法重复邀请！")
	//}
	//if playerById.ID_ == playerByCode.ID_ {
	//	//"无法邀请自己！"
	//	return errors.New("无法邀请自己！")
	//}
	//
	//playerById.InviteCode = iCode
	//
	////TODO playerTask
	return nil
}

func GetPlayerByOpenid(openid string) (*model.Player, error) {
	return model.GetPlayer(openid)
}

func EditPlayerInfo(p *model.Player) error {
	player, err := GetPlayerByOpenid(p.Openid)
	if player == nil {
		//没有找到对应的用户
		return errors.New(errs.UpdateUserError)
	}
	if p.State == model.NewerPlayer {
		p.State = model.NormalPlayer
	}
	p.ID = player.ID
	err = p.Save()
	if err != nil {
		return err
	}
	return nil
}
