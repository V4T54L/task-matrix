package config

type Config struct {
	DB_PATH     string
	SERVER_PORT string
	HashSecret  string
}

func GetConfig() *Config {
	return &Config{DB_PATH: "./out/db.sqlite", SERVER_PORT: ":8000", HashSecret: "adsjdkasdk"}
}
