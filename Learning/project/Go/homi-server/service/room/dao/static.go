package dao

import (
	"homi-server/common/data/repo"
	"homi-server/model/static"
)

var MotionRepo = &motionRepo{}
var RoomSkinRepo = &roomSkinRepo{}
var WhiteNoiseRepo = &whiteNoiseRepo{}
var RoomStarRepo = &roomStarRepo{}

func init() {
	repo.RepoContext.RegisterRepo(MotionRepo)
	repo.RepoContext.RegisterRepo(RoomSkinRepo)
	repo.RepoContext.RegisterRepo(WhiteNoiseRepo)
	repo.RepoContext.RegisterRepo(RoomStarRepo)
}

type motionRepo struct {
	repo.StaticRepo[static.Motion]
}

type roomSkinRepo struct {
	repo.StaticRepo[static.RoomSkin]
}

type whiteNoiseRepo struct {
	repo.StaticRepo[static.WhiteNoise]
}

type roomStarRepo struct {
	repo.StaticRepo[static.RoomStar]
}
