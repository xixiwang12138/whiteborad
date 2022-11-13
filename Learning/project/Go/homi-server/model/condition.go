package data

const (
	ConditionTypeFunc  = "func"
	ConditionTypeGold  = "gold"
	ConditionTypeLevel = "level"

	ConditionTypeRoomSkin = "roomSkin"
	ConditionTypeRoomStar = "roomStar"

	ConditionTypeMotion = "motion"

	ConditionTypeFocusCount = "focusCount" // 专注次数

	ConditionTypeInviteCount = "inviteCount"

	ConditionTypeScore = "score"
)

var CompareList = [6]string{"eq", "neq", "gt", "lt", "gte", "lte"}

type Condition struct {
	DBDataModel
	Type       string `json:"type"`
	Value      int    `json:"value"`
	Params     string `json:"params"`
	Compare    string `json:"compare"`
	Consumable bool   `json:"consumable"`
	ErrMsg     string `json:"errMsg"`
	RecordID   int64  `json:"recordID"` //对应业务数据的雪花ID
}

func NewCondition() *Condition {
	return &Condition{
		Type:       ConditionTypeGold,
		Value:      100,
		Compare:    "gte",
		Consumable: true,
		Params:     "{}",
	}
}
