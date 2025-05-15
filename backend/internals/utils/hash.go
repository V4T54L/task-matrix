package utils

import (
	"log"
	"crypto/sha512"
	"encoding/hex"
	"task-matrix-be/internals/config"
)

func Hash(plain string) (string, error) {
	hasher := sha512.New()
	
	cfg, err := config.GetConfig()
	if err != nil {
		// TODO: Handle error
		log.Println("Error loading config : ", err)
	}

	hasher.Write([]byte(plain + cfg.Hash_Secret))

	hash := hasher.Sum(nil)

	hashHex := hex.EncodeToString(hash)

	return hashHex, nil
}
