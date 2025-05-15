package repo

import (
	"context"
	"database/sql"
	"fmt"
)

type taskRepoImpl struct {
	db *sql.DB
}

// isProjectMember checks whether the user is a member of the given project
func (r *taskRepoImpl) isProjectMember(ctx context.Context, userID, projectID int) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS (
			SELECT 1 FROM project_members
			WHERE user_id = $1 AND project_id = $2
		)
	`
	err := r.db.QueryRowContext(ctx, query, userID, projectID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("membership check failed: %w", err)
	}
	return exists, nil
}

// CreateTask inserts a new task into the tasks table
func (r *taskRepoImpl) CreateTask(ctx context.Context, currentUserID, projectID int, title, description string, priorityID, statusID, assigneeID int) (int, error) {
	isMember, err := r.isProjectMember(ctx, currentUserID, projectID)
	if err != nil {
		return 0, err
	}
	if !isMember {
		return 0, fmt.Errorf("permission denied: user is not a member of the project")
	}

	query := `
		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id, status_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	var id int
	err = r.db.QueryRowContext(ctx, query, title, description, priorityID, assigneeID, projectID, statusID).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("create task: %w", err)
	}
	return id, nil
}

// UpdateTaskByID modifies an existing task's fields
func (r *taskRepoImpl) UpdateTaskByID(ctx context.Context, currentUserID, projectID, taskID int, title, description string, priorityID, statusID, assigneeID int) error {
	isMember, err := r.isProjectMember(ctx, currentUserID, projectID)
	if err != nil {
		return err
	}
	if !isMember {
		return fmt.Errorf("permission denied: user is not a member of the project")
	}

	query := `
		UPDATE tasks
		SET title = $1, description = $2, priority_id = $3, assignee_id = $4, status_id = $5
		WHERE id = $6 AND project_id = $7
	`
	_, err = r.db.ExecContext(ctx, query, title, description, priorityID, assigneeID, statusID, taskID, projectID)
	if err != nil {
		return fmt.Errorf("update task: %w", err)
	}
	return nil
}

// DeleteTaskByID removes a task from the database
func (r *taskRepoImpl) DeleteTaskByID(ctx context.Context, currentUserID, projectID, taskID int) error {
	isMember, err := r.isProjectMember(ctx, currentUserID, projectID)
	if err != nil {
		return err
	}
	if !isMember {
		return fmt.Errorf("permission denied: user is not a member of the project")
	}

	query := `
		DELETE FROM tasks
		WHERE id = $1 AND project_id = $2
	`
	_, err = r.db.ExecContext(ctx, query, taskID, projectID)
	if err != nil {
		return fmt.Errorf("delete task: %w", err)
	}
	return nil
}