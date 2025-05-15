package server

import (
	"net/http"
	"task-matrix-be/internals/middlewares"
	"task-matrix-be/internals/models"
	"task-matrix-be/internals/services"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
)

func NewChiRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(httprate.LimitByIP(100, time.Minute))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	return r
}

func RegisterRoutes(r *chi.Mux, user services.UserService, project services.ProjectService, task services.TaskService, validateTokenFunc func(tokenStr string) (models.User, error)) {
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("healthy"))
	})

	r.Route("/auth", func(r chi.Router) {
		r.Post("/login", user.Login)
		r.Post("/signup", user.Signup)
		r.Route("/validate", func(r chi.Router) {
			r.Use(middlewares.AuthMiddleware(validateTokenFunc))
			r.Get("/", user.GetLoggedInUser)
		})
	})

	r.Route("/", func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware(validateTokenFunc))

		r.Route("/projects", func(r chi.Router) {
			r.Post("/", project.CreateProject)
			r.Get("/", project.GetAllProjects)
			r.Get("/{id}", project.ViewProject)
			r.Put("/{id}", project.UpdateProject)
			r.Post("/{id}/members/{username}", project.AddMemberToProject)
			r.Delete("/{id}/members/{userID}", project.RemoveMemberFromProject)
			r.Delete("/{id}", project.DeleteProject)
			r.Route("/{projectId}/tasks", func(r chi.Router) {
				r.Post("/", task.CreateTask)
				r.Put("/{taskId}", task.UpdateTask)
				r.Delete("/{taskId}", task.DeleteTask)
			})
		})
	})
}
