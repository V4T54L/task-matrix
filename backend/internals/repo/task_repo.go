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
			WHERE user_id = ? AND project_id = ?
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
		VALUES (?, ?, ?, ?, ?, ?)
	`
	result, err := r.db.ExecContext(ctx, query, title, description, priorityID, assigneeID, projectID, statusID)
	if err != nil {
		return 0, fmt.Errorf("create task: %w", err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("get inserted task id: %w", err)
	}
	return int(id), nil
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
		SET title = ?, description = ?, priority_id = ?, assignee_id = ?, status_id = ?
		WHERE id = ? AND project_id = ?
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
		WHERE id = ? AND project_id = ?
	`
	_, err = r.db.ExecContext(ctx, query, taskID, projectID)
	if err != nil {
		return fmt.Errorf("delete task: %w", err)
	}
	return nil
}