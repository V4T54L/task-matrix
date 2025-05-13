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

type taskServiceImpl struct {
	repo repo.TaskRepo
}

func (s *taskServiceImpl) CreateTask(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	projectIDStr := chi.URLParam(r, "projectId")
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	var payload models.TaskPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(payload.Title) == "" {
		http.Error(w, "Task title is required", http.StatusBadRequest)
		return
	}

	taskID, err := s.repo.CreateTask(
		r.Context(), currentUser.ID, projectID,
		payload.Title, payload.Description,
		payload.PriorityID, payload.StatusID, payload.AssigneeID,
	)
	if err != nil {
		http.Error(w, "Failed to create task", http.StatusInternalServerError)
		return
	}

	task := models.Task{
		ID:          taskID,
		Title:       payload.Title,
		Description: payload.Description,
		Priority:    models.Priority{ID: payload.PriorityID},
		Status:      models.Status{ID: payload.StatusID},
		Assignee:    models.User{ID: payload.AssigneeID},
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

func (s *taskServiceImpl) UpdateTask(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	projectID, err := strconv.Atoi(chi.URLParam(r, "projectId"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}
	taskID, err := strconv.Atoi(chi.URLParam(r, "taskId"))
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	var payload models.TaskPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(payload.Title) == "" {
		http.Error(w, "Task title is required", http.StatusBadRequest)
		return
	}

	err = s.repo.UpdateTaskByID(
		r.Context(), currentUser.ID, projectID, taskID,
		payload.Title, payload.Description,
		payload.PriorityID, payload.StatusID, payload.AssigneeID,
	)
	if err != nil {
		http.Error(w, "Failed to update task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Task updated successfully"}`))
}

func (s *taskServiceImpl) DeleteTask(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "Unauthorized: middleware not mounted", http.StatusUnauthorized)
		return
	}

	projectID, err := strconv.Atoi(chi.URLParam(r, "projectId"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}
	taskID, err := strconv.Atoi(chi.URLParam(r, "taskId"))
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	err = s.repo.DeleteTaskByID(r.Context(), currentUser.ID, projectID, taskID)
	if err != nil {
		http.Error(w, "Failed to delete task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Task deleted successfully"}`))
}
