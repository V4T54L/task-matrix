package repo

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"task-matrix-be/internals/models"
)

type projectRepoImpl struct {
	db *sql.DB
}

// CreateProject inserts a new project with currentUserID as the owner
func (r *projectRepoImpl) CreateProject(ctx context.Context, currentUserID int, name, description, dueDate string) (int, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, fmt.Errorf("begin transaction: %w", err)
	}

	insertProjectQuery := `
		INSERT INTO projects (owner_id, title, description, due_date)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	var projectID int
	err = tx.QueryRowContext(ctx, insertProjectQuery, currentUserID, name, description, dueDate).Scan(&projectID)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("insert project: %w", err)
	}

	insertMemberQuery := `
		INSERT INTO project_members (project_id, user_id)
		VALUES ($1, $2)
	`
	_, err = tx.ExecContext(ctx, insertMemberQuery, projectID, currentUserID)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("insert project member: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("commit transaction: %w", err)
	}

	return projectID, nil
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
		WHERE p.deleted_at IS NULL AND pm.user_id = $1  AND p.deleted_at IS NULL
		GROUP BY p.id, s.id, u.id
	`

	rows, err := r.db.QueryContext(ctx, query, currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []models.Project
	projectMap := make(map[int]*models.Project)
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
		p.Members = make([]models.User, 0, 1)
		projectMap[p.ID] = &p
		projects = append(projects, p)
	}

	if len(projects) == 0 {
		return make([]models.Project, 0), nil
	}

	projectIDs := make([]any, 0, len(projects))
	for _, p := range projects {
		projectIDs = append(projectIDs, p.ID)
	}

	memberQuery := `
		SELECT
			pm.project_id,
			u.id, u.name, u.username, u.email, u.avatar_url
		FROM project_members pm
		JOIN users u ON u.id = pm.user_id
		WHERE pm.project_id IN (` + placeholders(len(projectIDs)) + `)
	`

	memberRows, err := r.db.QueryContext(ctx, memberQuery, projectIDs...)
	if err != nil {
		return nil, err
	}
	defer memberRows.Close()

	for memberRows.Next() {
		var projectID int
		var user models.User
		if err := memberRows.Scan(&projectID, &user.ID, &user.Name, &user.Username, &user.Email, &user.AvatarUrl); err != nil {
			return nil, err
		}
		if project, exists := projectMap[projectID]; exists {
			project.Members = append(project.Members, user)
		}
	}

	projects = make([]models.Project, 0, len(projectMap))
	for _, projectPtr := range projectMap {
		projects = append(projects, *projectPtr)
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
		WHERE p.id = $1 AND p.deleted_at IS NULL
	`
	err := r.db.QueryRowContext(ctx, projectQuery, projectID).Scan(
		&pd.ID, &pd.Name, &pd.Description, &pd.DueDate,
		&pd.Status.ID, &pd.Status.Name,
		&pd.Owner.ID, &pd.Owner.Name, &pd.Owner.Username, &pd.Owner.Email, &pd.Owner.AvatarUrl,
	)
	if err != nil {
		return pd, fmt.Errorf("get project by ID: %w", err)
	}

	membersQuery := `
		SELECT u.id, u.name, u.username, u.email, u.avatar_url
		FROM project_members pm
		JOIN users u ON u.id = pm.user_id
		WHERE pm.project_id = $1
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

	tasksQuery := `
		SELECT t.id, t.title, t.description,
		       p.id, p.name,
		       s.id, s.name,
		       u.id, u.name, u.username, u.email, u.avatar_url
		FROM tasks t
		JOIN priorities p ON p.id = t.priority_id
		JOIN statuses s ON s.id = t.status_id
		JOIN users u ON u.id = t.assignee_id
		WHERE t.project_id = $1
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
			&t.Status.ID, &t.Status.Name,
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
		SET title = $1, description = $2, due_date = $3, status_id = $4
		WHERE id = $5 AND owner_id = $6;
	`
	_, err := r.db.ExecContext(ctx, query, name, description, dueDate, statusId, projectID, currentUserID)
	if err != nil {
		return models.Project{}, fmt.Errorf("update project: %w", err)
	}

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

	var ownerID int
	err := r.db.QueryRowContext(ctx, `SELECT owner_id FROM projects WHERE id = $1`, projectID).Scan(&ownerID)
	if err != nil {
		return u, fmt.Errorf("project not found or fetch failed: %w", err)
	}
	if ownerID != currentUserID {
		return u, fmt.Errorf("permission denied: user is not the owner of the project")
	}

	query := `
		SELECT id, name, username, email, avatar_url FROM users WHERE username = $1
	`
	err = r.db.QueryRowContext(ctx, query, username).Scan(&u.ID, &u.Name, &u.Username, &u.Email, &u.AvatarUrl)
	if err != nil {
		return u, fmt.Errorf("user not found: %w", err)
	}

	_, err = r.db.ExecContext(ctx, `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)`, projectID, u.ID)
	if err != nil {
		return u, fmt.Errorf("add member failed: %w", err)
	}

	return u, nil
}

// RemoveMemberFromProject removes a user from the project
func (r *projectRepoImpl) RemoveMemberFromProject(ctx context.Context, currentUserID, projectID, userID int) error {
	var ownerID int
	err := r.db.QueryRowContext(ctx, `SELECT owner_id FROM projects WHERE id = $1`, projectID).Scan(&ownerID)
	if err != nil {
		return fmt.Errorf("project not found or fetch failed: %w", err)
	}
	if ownerID != currentUserID {
		return fmt.Errorf("permission denied: user is not the owner of the project")
	}
	if userID == currentUserID {
		return fmt.Errorf("cannot remove project owner from the project")
	}

	_, err = r.db.ExecContext(ctx,
		`DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
		projectID, userID)
	if err != nil {
		return fmt.Errorf("remove member failed: %w", err)
	}
	return nil
}

// DeleteProjectByID soft-deletes a project
func (r *projectRepoImpl) DeleteProjectByID(ctx context.Context, currentUserID, projectID int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND owner_id = $2`,
		projectID, currentUserID)
	if err != nil {
		return fmt.Errorf("delete project failed: %w", err)
	}
	return nil
}

// placeholders generates $1,$2,... for PostgreSQL IN clauses
func placeholders(n int) string {
	var b strings.Builder
	for i := 1; i <= n; i++ {
		b.WriteString(fmt.Sprintf("$%d", i))
		if i < n {
			b.WriteString(", ")
		}
	}
	return b.String()
}
