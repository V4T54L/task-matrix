package dbconnectors

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

func GetSqliteDb(filePath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", filePath)
	if err == nil {
		err = db.Ping()
	}

	return db, err
}

func CloseSqlDBConn(db *sql.DB) error {
	return db.Close()
}
