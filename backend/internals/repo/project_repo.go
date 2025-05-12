package repo

import (
	"context"
	"database/sql"
	"fmt"
	"task-matrix-be/internals/models"
)

type projectRepoImpl struct {
	db *sql.DB
}

func NewProjectRepo(db *sql.DB) ProjectRepo {
	return &projectRepoImpl{db: db}
}

// CreateProject inserts a new project with currentUserID as the owner
func (r *projectRepoImpl) CreateProject(ctx context.Context, currentUserID int, name, description, dueDate string) (int, error) {
	query := `
		INSERT INTO projects (owner_id, title, description, due_date)
		VALUES (?, ?, ?, ?)
	`
	result, err := r.db.ExecContext(ctx, query, currentUserID, name, description, dueDate)
	if err != nil {
		return 0, fmt.Errorf("create project: %w", err)
	}
	id, err := result.LastInsertId()
	return int(id), err
}

// GetProjects returns all projects the user owns or is a member of
func (r *projectRepoImpl) GetProjects(ctx context.Context, currentUserID int) ([]models.Project, error) {
	query := `
		SELECT
			p.id, p.title, p.description, p.due_date,
			s.id, s.name,
			u.id, u.name, u.username, u.email, u.avatar_url,
			(SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
			(SELECT COUNT(*) FROM tasks t JOIN statuses st ON t.status_id = st.id WHERE t.project_id = p.id AND st.name = 'Completed') as tasks_completed
		FROM projects p
		JOIN statuses s ON s.id = p.status_id
		JOIN users u ON u.id = p.owner_id
		LEFT JOIN project_members pm ON pm.project_id = p.id
		WHERE p.deleted_at IS NULL AND (p.owner_id = ? OR pm.user_id = ?)
		GROUP BY p.id
	`
	rows, err := r.db.QueryContext(ctx, query, currentUserID, currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.DueDate,
			&p.Status.ID, &p.Status.Name,
			&p.Owner.ID, &p.Owner.Name, &p.Owner.Username, &p.Owner.Email, &p.Owner.AvatarUrl,
			&p.TotalTasks, &p.TasksCompleted,
		)
		if err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}
	return projects, nil
}

// GetProjectByID returns a detailed view of a project
func (r *projectRepoImpl) GetProjectByID(ctx context.Context, currentUserID, projectID int) (models.ProjectDetail, error) {
	var pd models.ProjectDetail

	projectQuery := `
		SELECT p.id, p.title, p.description, p.due_date,
		       s.id, s.name,
		       u.id, u.name, u.username, u.email, u.avatar_url
		FROM projects p
		JOIN statuses s ON s.id = p.status_id
		JOIN users u ON u.id = p.owner_id
		WHERE p.id = ? AND p.deleted_at IS NULL
	`
	err := r.db.QueryRowContext(ctx, projectQuery, projectID).Scan(
		&pd.ID, &pd.Name, &pd.Description, &pd.DueDate,
		&pd.Status.ID, &pd.Status.Name,
		&pd.Owner.ID, &pd.Owner.Name, &pd.Owner.Username, &pd.Owner.Email, &pd.Owner.AvatarUrl,
	)
	if err != nil {
		return pd, fmt.Errorf("get project by ID: %w", err)
	}

	// Members
	membersQuery := `
		SELECT u.id, u.name, u.username, u.email, u.avatar_url
		FROM project_members pm
		JOIN users u ON u.id = pm.user_id
		WHERE pm.project_id = ?
	`
	memberRows, err := r.db.QueryContext(ctx, membersQuery, projectID)
	if err != nil {
		return pd, err
	}
	defer memberRows.Close()

	for memberRows.Next() {
		var u models.User
		if err := memberRows.Scan(&u.ID, &u.Name, &u.Username, &u.Email, &u.AvatarUrl); err != nil {
			return pd, err
		}
		pd.Members = append(pd.Members, u)
	}

	// Tasks
	tasksQuery := `
		SELECT t.id, t.title, t.description,
		       p.id, p.name,
		       s.name,
		       u.id, u.name, u.username, u.email, u.avatar_url
		FROM tasks t
		JOIN priorities p ON p.id = t.priority_id
		JOIN statuses s ON s.id = t.status_id
		JOIN users u ON u.id = t.assignee_id
		WHERE t.project_id = ?
	`
	taskRows, err := r.db.QueryContext(ctx, tasksQuery, projectID)
	if err != nil {
		return pd, err
	}
	defer taskRows.Close()

	for taskRows.Next() {
		var t models.Task
		err := taskRows.Scan(&t.ID, &t.Title, &t.Description,
			&t.Priority.ID, &t.Priority.Name,
			&t.Status,
			&t.Assignee.ID, &t.Assignee.Name, &t.Assignee.Username, &t.Assignee.Email, &t.Assignee.AvatarUrl,
		)
		if err != nil {
			return pd, err
		}
		pd.Tasks = append(pd.Tasks, t)
	}

	return pd, nil
}

// UpdateProjectByID updates a project if the user is the owner
func (r *projectRepoImpl) UpdateProjectByID(ctx context.Context, currentUserID, projectID int, name, description, dueDate string, statusId int) (models.Project, error) {
	query := `
		UPDATE projects
		SET title = ?, description = ?, due_date = ?, status_id = ?
		WHERE id = ? AND owner_id = ?
	`
	_, err := r.db.ExecContext(ctx, query, name, description, dueDate, statusId, projectID, currentUserID)
	if err != nil {
		return models.Project{}, fmt.Errorf("update project: %w", err)
	}

	// Re-fetch as Project
	projects, err := r.GetProjects(ctx, currentUserID)
	if err != nil {
		return models.Project{}, err
	}
	for _, p := range projects {
		if p.ID == projectID {
			return p, nil
		}
	}
	return models.Project{}, sql.ErrNoRows
}

// AddMemberToProject adds a user to the project by username
func (r *projectRepoImpl) AddMemberToProject(ctx context.Context, currentUserID, projectID int, username string) (models.User, error) {
	var u models.User
	query := `
		SELECT id, name, username, email, avatar_url FROM users WHERE username = ?
	`
	err := r.db.QueryRowContext(ctx, query, username).Scan(&u.ID, &u.Name, &u.Username, &u.Email, &u.AvatarUrl)
	if err != nil {
		return u, fmt.Errorf("user not found: %w", err)
	}

	_, err = r.db.ExecContext(ctx, `INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, projectID, u.ID)
	if err != nil {
		return u, fmt.Errorf("add member failed: %w", err)
	}
	return u, nil
}

// RemoveMemberFromProject removes a user from the project
func (r *projectRepoImpl) RemoveMemberFromProject(ctx context.Context, currentUserID, projectID, userID int) error {
	_, err := r.db.ExecContext(ctx,
		`DELETE FROM project_members WHERE project_id = ? AND user_id = ?`,
		projectID, userID)
	if err != nil {
		return fmt.Errorf("remove member failed: %w", err)
	}
	return nil
}

// DeleteProjectByID soft-deletes a project by marking deleted_at
func (r *projectRepoImpl) DeleteProjectByID(ctx context.Context, currentUserID, projectID int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_id = ?`,
		projectID, currentUserID)
	if err != nil {
		return fmt.Errorf("delete project failed: %w", err)
	}
	return nil
}
