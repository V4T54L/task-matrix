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

func NewUserRepo(db *sql.DB) UserRepo {
	return &userRepoImpl{db: db}
}

func (r *userRepoImpl) CreateUser(ctx context.Context, name, username, email, avatarUrl, hashedPassword string) (int, error) {
	query := `
		INSERT INTO users (name, username, email, avatar_url, password)
		VALUES (?, ?, ?, ?, ?)
	`
	result, err := r.db.ExecContext(ctx, query, name, username, email, avatarUrl, hashedPassword)
	if err != nil {
		return 0, fmt.Errorf("failed to create user: %w", err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve last insert ID: %w", err)
	}
	return int(id), nil
}

func (r *userRepoImpl) GetUserByCreds(ctx context.Context, username, hashedPassword string) (*models.User, error) {
	query := `
		SELECT id, name, username, email, avatar_url
		FROM users
		WHERE username = ? AND password = ?
	`
	row := r.db.QueryRowContext(ctx, query, username, hashedPassword)
	var user models.User
	if err := row.Scan(&user.ID, &user.Name, &user.Username, &user.Email, &user.AvatarUrl); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by credentials: %w", err)
	}
	return &user, nil
}
