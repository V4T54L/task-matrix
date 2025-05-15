package repo

import (
	"context"
	"database/sql"
	"fmt"
	"task-matrix-be/internals/models"
)

type userRepoImpl struct {
	db *sql.DB
}

// CreateUser inserts a new user and returns the generated ID
func (r *userRepoImpl) CreateUser(ctx context.Context, name, username, email, avatarUrl, hashedPassword string) (int, error) {
	query := `
	INSERT INTO users (name, username, email, avatar_url, password)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id
	`
	var id int
	err := r.db.QueryRowContext(ctx, query, name, username, email, avatarUrl, hashedPassword).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("failed to create user: %w", err)
	}
	return id, nil
}

// GetUserByCreds fetches a user by username and password
func (r *userRepoImpl) GetUserByCreds(ctx context.Context, username, hashedPassword string) (*models.User, error) {
	query := `
	SELECT id, name, username, email, avatar_url
	FROM users
	WHERE username = $1 AND password = $2
	`
	row := r.db.QueryRowContext(ctx, query, username, hashedPassword)

	var user models.User
	if err := row.Scan(&user.ID, &user.Name, &user.Username, &user.Email, &user.AvatarUrl); err != nil {
		return nil, fmt.Errorf("failed to get user by credentials: %w", err)
	}
	return &user, nil
}
