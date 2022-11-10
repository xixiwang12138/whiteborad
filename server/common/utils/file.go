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

func WriteFile(filePath string, data []byte) error {
	var file *os.File
	if !ExistFile(filePath) {
		newFile, err := os.Create(filePath)
		if err != nil {
			return err
		}
		file = newFile
	} else {
		existFile, err := os.Open(filePath)
		if err != nil {
			return err
		}
		file = existFile
	}
	_, err := file.Write(data)
	return err
}
