package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"task-matrix-be/internals/authmodule"
	"task-matrix-be/internals/config"
	"task-matrix-be/internals/dbconnectors"
	"task-matrix-be/internals/migrate"
	"task-matrix-be/internals/models"
	"task-matrix-be/internals/server"
	"task-matrix-be/internals/services"
)

func main() {
	if os.Getenv("ENVIRONMENT") != "PRODUCTION" {
		err := config.LoadConfigurationFile(".env")
		if err != nil {
			log.Fatal("Error loading .env : ", err)
		}
	}
	cfg, err := config.GetConfig()
	if err != nil {
		log.Fatal("Error loading config : ", err)
	}

	auth := authmodule.NewInMemoryUUIDAuth[models.User]()
	db, err := dbconnectors.GetPostgresDb(cfg.DB_URI)
	if err != nil {
		log.Fatal("Error connecting to postgres db: ", err)
	}

	defer func() {
		if err = dbconnectors.CloseSqlDBConn(db); err != nil {
			log.Println("Error closing postgres db: ", err)
		}
	}()

	log.Println("Postgres connected successfully! ")

	if err := migrate.MigratePostgres(context.Background(), db); err != nil {
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
		Addr:    cfg.SERVER_PORT,
		Handler: r,
	}

	server.RunWithGracefulShutdown(&s)
}
