package utils

import (
	"github.com/pkg/errors"
	"os"
)

func ExistFile(filePath string) bool {
	_, err := os.Stat(filePath)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}

func ReadFile(filePath string) ([]byte, error) {
	if !ExistFile(filePath) {
		return nil, errors.New("file path not exits")
	}
	return os.ReadFile(filePath)
}
