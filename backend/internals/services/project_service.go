package services

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"task-matrix-be/internals/middlewares"
	"task-matrix-be/internals/models"
	"task-matrix-be/internals/repo"

	"github.com/go-chi/chi/v5"
)

type projectServiceImpl struct {
	repo repo.ProjectRepo
}

func (s *projectServiceImpl) CreateProject(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	var payload models.ProjectPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(payload.Name) == "" || strings.TrimSpace(payload.DueDate) == "" {
		http.Error(w, "Project name and due date are required", http.StatusBadRequest)
		return
	}

	id, err := s.repo.CreateProject(r.Context(), currentUser.ID, payload.Name, payload.Description, payload.DueDate)
	if err != nil {
		http.Error(w, "Failed to create project", http.StatusInternalServerError)
		return
	}

	project := models.Project{
		ID:             id,
		Name:           payload.Name,
		Description:    payload.Description,
		DueDate:        payload.DueDate,
		Status:         models.Status{ID: 1, Name: "TODO"},
		Owner:          currentUser,
		Members:        []models.User{currentUser},
		TasksCompleted: 0,
		TotalTasks:     0,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(project)
}

func (s projectServiceImpl) GetAllProjects(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	projects, err := s.repo.GetProjects(r.Context(), currentUser.ID)
	if err != nil {
		http.Error(w, "Failed to query projects", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(projects)
}

func (s projectServiceImpl) ViewProject(w http.ResponseWriter, r *http.Request) {

	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "project ID not provided", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "unable to parse project ID", http.StatusBadRequest)
		return
	}

	project, err := s.repo.GetProjectByID(r.Context(), currentUser.ID, id)
	if err != nil {
		http.Error(w, "Failed to query the project", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(project)
}

func (s projectServiceImpl) UpdateProject(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "project ID not provided", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "unable to parse project ID", http.StatusBadRequest)
		return
	}

	var payload models.ProjectPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(payload.Name) == "" || strings.TrimSpace(payload.DueDate) == "" {
		http.Error(w, "Project name and due date are required", http.StatusBadRequest)
		return
	}

	project, err := s.repo.UpdateProjectByID(r.Context(), currentUser.ID, id, payload.Name, payload.Description, payload.DueDate, payload.StatusID)
	if err != nil {
		http.Error(w, "Failed to update the project", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(project)
}

func (s projectServiceImpl) AddMemberToProject(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "project ID not provided", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "unable to parse project ID", http.StatusBadRequest)
		return
	}

	memberUsername := chi.URLParam(r, "username")
	if memberUsername == "" {
		http.Error(w, "member's username not provided", http.StatusBadRequest)
		return
	}

	user, err := s.repo.AddMemberToProject(r.Context(), currentUser.ID, id, memberUsername)
	if err != nil {
		http.Error(w, "Failed to add member to the project", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

func (s projectServiceImpl) RemoveMemberFromProject(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "project ID not provided", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "unable to parse project ID", http.StatusBadRequest)
		return
	}

	memberUserIDStr := chi.URLParam(r, "userID")
	if memberUserIDStr == "" {
		http.Error(w, "member's userID not provided", http.StatusBadRequest)
		return
	}

	memberUserID, err := strconv.Atoi(memberUserIDStr)
	if err != nil {
		http.Error(w, "unable to parse member user ID ID", http.StatusBadRequest)
		return
	}

	err = s.repo.RemoveMemberFromProject(r.Context(), currentUser.ID, id, memberUserID)
	if err != nil {
		http.Error(w, "Failed to remove the project", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

}

func (s projectServiceImpl) DeleteProject(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "project ID not provided", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "unable to parse project ID", http.StatusBadRequest)
		return
	}

	err = s.repo.DeleteProjectByID(r.Context(), currentUser.ID, id)
	if err != nil {
		http.Error(w, "Failed to remove the project", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
