package playerdata

type PlayerTask struct {
	PlayerData `json:",inline" bson:",inline"`
	InviteTask PlayerInviteTask `json:"inviteTask" bson:"inviteTask"`
}

type PlayerInviteTask struct {
	Count          int        `json:"count" bson:"count"`
	ClaimedRewards [2]float64 `json:"claimedRewards" bson:"claimedRewards"`
}

func (task *PlayerInviteTask) Save() {
	//if task.ID_ == 0 {
	//	DbOpr.Model(task).Create(task)
	//} else {
	//	DbOpr.Save(task)
	//}
}

func (task *PlayerInviteTask) Invite() {
	//task.Count++
	//PlayerTaskRepo.Save(task)
}

func (task *PlayerInviteTask) Claim(index int) {
	//str := task.ClaimedRewards
	//rebuild, err := utils.Rebuild[int](str)
	//if err != nil {
	//	return
	//}
	//_, flag := utils.FindBasic(rebuild, index)
	//if flag == false {
	//	rebuild = append(rebuild, index)
	//}
	//updateStr, _ := utils.ToString(rebuild)
	//task.ClaimedRewards = updateStr
	//task.Save()
}
