package repo

import (
	"context"
	"task-matrix-be/internals/models"
)

type UserRepo interface {
	CreateUser(ctx context.Context, name, username, email, hashedPassword string) (id int, err error)
	GetUserByCreds(ctx context.Context, username, hashedPassword string) (user *models.User, err error)
}

type ProjectRepo interface {
	CreateProject(ctx context.Context, currentUserID int, name, description, due_date string) (id int, err error)
	GetProjects(ctx context.Context, currentUserID int) ([]models.Project, error)
	GetProjectByID(ctx context.Context, currentUserID, projectID int) (models.ProjectDetail, error)
	UpdateProjectByID(ctx context.Context, currentUserID, projectID int, name, description, dueDate string, statusId int) (models.Project, error)
	AddMemberToProject(ctx context.Context, currentUserID, projectID int, username string) (models.User, error)
	RemoveMemberFromProject(ctx context.Context, currentUserID, projectID, userID int) error
	DeleteProjectByID(ctx context.Context, currentUserID, projectID int) error
}

type TaskRepo interface {
	CreateTask(ctx context.Context, currentUserID, projectID int, title, description string, priorityID, statusID, assigneeID int) (id int, err error)
	UpdateTaskByID(ctx context.Context, currentUserID, projectID, taskID int, title, description string, priorityID, statusID, assigneeID int) (err error)
	DeleteTaskByID(ctx context.Context, currentUserID, projectID, taskID int) (err error)
}
