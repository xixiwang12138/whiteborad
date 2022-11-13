package cache

//region 业务数据存储方式定义

//登录

// TokenKey 登录，存储JWT字符串
func TokenKey(openid string) string {
	return "token:" + openid
}

//房间

// RoomEnteringPlayersKey 房间中玩家，存储的是一个set集合（存储玩家openid）
func RoomEnteringPlayersKey(roomId string) string {
	return "RoomEnteringPlayers:" + roomId
}

//专注过程中

// RoomFocusingPlayersKey 使用集合存储，存储房间中所有专注的名单
func RoomFocusingPlayersKey(roomId string) string {
	return "RoomFocusingPlayers:" + roomId
}

// RuntimeFocusKey 格式(RuntimeFocus:${openid}) 获得该用户当前的 RuntimeFocus
// openid 是用户的openid
func RuntimeFocusKey(openid string) string {
	return "RuntimeFocus:" + openid
}

//endregion
