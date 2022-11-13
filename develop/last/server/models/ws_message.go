package models

const (
	LoadMessage         = "load"
	CmdMessage          = "cmd"
	MemberChangeMessage = "member"
)

type Message struct {
	Type string `json:"type"`
	Data string `json:"data"`
}

const (
	MemberEnter = "enter"
	MemberLeave = "leave"
)

type MemberMessage struct {
	Type    string `json:"type"`
	Payload *User  `json:"payload"`
}
