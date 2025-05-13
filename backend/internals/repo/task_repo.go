package repo

import (
	"context"
	"database/sql"
	"fmt"
)

type taskRepoImpl struct {
	db *sql.DB
}

// CreateTask inserts a new task into the database
func (r *taskRepoImpl) CreateTask(ctx context.Context, currentUserID, projectID int, title, description string, priorityID, statusID, assigneeID int) (int, error) {
	// Optional: You can check here if the currentUserID has access to the project
	query := `
		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id)
		VALUES (?, ?, ?, ?, ?)
	`
	result, err := r.db.ExecContext(ctx, query, title, description, priorityID, assigneeID, projectID)
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
	query := `
		UPDATE tasks
		SET title = ?, description = ?, priority_id = ?, assignee_id = ?, project_id = ?
		WHERE id = ? AND project_id = ?
	`
	_, err := r.db.ExecContext(ctx, query, title, description, priorityID, assigneeID, projectID, taskID, projectID)
	if err != nil {
		return fmt.Errorf("update task: %w", err)
	}

	// Optional: You could verify affected rows if needed
	return nil
}

// DeleteTaskByID removes a task from the database
func (r *taskRepoImpl) DeleteTaskByID(ctx context.Context, currentUserID, projectID, taskID int) error {
	query := `
		DELETE FROM tasks
		WHERE id = ? AND project_id = ?
	`
	_, err := r.db.ExecContext(ctx, query, taskID, projectID)
	if err != nil {
		return fmt.Errorf("delete task: %w", err)
	}
	return nil
}
