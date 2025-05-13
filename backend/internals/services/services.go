package services

import (
	"database/sql"
	"errors"
	"net/http"
	"task-matrix-be/internals/models"
	"task-matrix-be/internals/repo"
)

type UserService interface {
	Login(w http.ResponseWriter, r *http.Request)
	Signup(w http.ResponseWriter, r *http.Request)
	GetLoggedInUser(w http.ResponseWriter, r *http.Request)
}

type ProjectService interface {
	CreateProject(w http.ResponseWriter, r *http.Request)
	GetAllProjects(w http.ResponseWriter, r *http.Request)
	ViewProject(w http.ResponseWriter, r *http.Request)
	UpdateProject(w http.ResponseWriter, r *http.Request)
	AddMemberToProject(w http.ResponseWriter, r *http.Request)
	RemoveMemberFromProject(w http.ResponseWriter, r *http.Request)
	DeleteProject(w http.ResponseWriter, r *http.Request)
}

type TaskService interface {
	CreateTask(w http.ResponseWriter, r *http.Request)
	UpdateTask(w http.ResponseWriter, r *http.Request)
	DeleteTask(w http.ResponseWriter, r *http.Request)
}

func GetServices(
	db *sql.DB,
	tokenGenerator func(payload models.User) (string, error),
) (UserService, ProjectService, TaskService, error) {
	if db == nil || tokenGenerator == nil {
		return nil, nil, nil, errors.New("invalid params passed to GetServices")
	}

	ur, pr, tr, err := repo.GetRepos(db)
	if err != nil {
		return nil, nil, nil, err
	}

	return &userServiceImpl{repo: ur, tokenGenerator: tokenGenerator}, &projectServiceImpl{repo: pr}, &taskServiceImpl{repo: tr}, nil
}
