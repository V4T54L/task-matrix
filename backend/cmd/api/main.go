package main

import (
	"context"
	"log"
	"net/http"
	"task-matrix-be/internals/config"
	"task-matrix-be/internals/dbconnectors"
	"task-matrix-be/internals/migrate"
	"task-matrix-be/internals/server"
)

func main() {
	db, err := dbconnectors.GetSqliteDb(config.GetConfig().DB_PATH)
	if err != nil {
		log.Fatal("Error connecting to sqlite db: ", err)
	}

	defer func() {
		if err = dbconnectors.CloseSqlDBConn(db); err != nil {
			log.Println("Error closing sqlite db: ", err)
		}
	}()

	log.Println("SQLite connected successfully! ")

	if err := migrate.MigrateSQLite(context.Background(), db); err != nil {
		log.Fatal("Error mograting database : ", err)
	}

	r := server.NewChiRouter()
	server.RegisterRoutes(r)

	s := http.Server{
		Addr:    ":8000",
		Handler: r,
	}

	server.RunWithGracefulShutdown(&s)
}
