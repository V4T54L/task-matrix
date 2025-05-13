package utils

import (
	"crypto/sha512"
	"encoding/hex"
	"task-matrix-be/internals/config"
)

func Hash(plain string) (string, error) {
	hasher := sha512.New()

	hasher.Write([]byte(plain + config.GetConfig().HashSecret))

	hash := hasher.Sum(nil)

	hashHex := hex.EncodeToString(hash)

	return hashHex, nil
}
