package dbconnectors

import (
	"database/sql"

	_ "github.com/lib/pq"
)

func GetPostgresDb(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err == nil {
		err = db.Ping()
	}

	return db, err
}