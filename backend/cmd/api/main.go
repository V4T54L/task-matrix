package main

import (
	"context"
	"log"
	"net/http"
	"task-matrix-be/internals/authmodule"
	"task-matrix-be/internals/config"
	"task-matrix-be/internals/dbconnectors"
	"task-matrix-be/internals/migrate"
	"task-matrix-be/internals/models"
	"task-matrix-be/internals/server"
	"task-matrix-be/internals/services"
)

func main() {
	// TODO: Add restrictions on fetching and updating projects & tasks
	auth := authmodule.NewInMemoryUUIDAuth[models.User]()
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

	user, project, task, err := services.GetServices(db, auth.GetToken)
	if err != nil {
		log.Fatal("Error initializing services : ", err)
	}
	log.Println("[+] Services Initialized")

	r := server.NewChiRouter()
	server.RegisterRoutes(r, user, project, task, auth.Validate)

	log.Println("[+] Routes registered")

	s := http.Server{
		Addr:    config.GetConfig().SERVER_PORT,
		Handler: r,
	}

	server.RunWithGracefulShutdown(&s)
}
