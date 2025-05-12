package middlewares

import (
	"context"
	"net/http"
	"strings"
	"task-matrix-be/internals/models"
)

type contextKey string

const UserContextKey = contextKey("user")

func AuthMiddleware(validator func(token string) (models.User, error)) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
				return
			}

			// Expect header in form "Bearer <token>"
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
				return
			}
			token := strings.TrimSpace(parts[1])
			if token == "" {
				http.Error(w, "Empty token", http.StatusUnauthorized)
				return
			}

			user, err := validator(token)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
