package utils

func Hash(plain string) (string, error) {
	// TODO: Implement a better hash function.
	// hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	// if err != nil {
	// 	return "", err
	// }
	// return string(hash), nil

	return plain + "_hash", nil
}
