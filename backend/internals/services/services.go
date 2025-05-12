package services

import "net/http"

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
