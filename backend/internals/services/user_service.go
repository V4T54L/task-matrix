package services

import (
	"encoding/json"
	"net/http"
	"task-matrix-be/internals/middlewares"
	"task-matrix-be/internals/models"
	"task-matrix-be/internals/repo"
	"task-matrix-be/internals/utils"
)

type userServiceImpl struct {
	repo           repo.UserRepo
	tokenGenerator func(payload models.User) (string, error)
}

func (s *userServiceImpl) Login(w http.ResponseWriter, r *http.Request) {
	var payload models.LoginPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if payload.Username == "" || payload.Password == "" {
		http.Error(w, "Username and password are required", http.StatusBadRequest)
		return
	}

	hashed, err := utils.Hash(payload.Password)
	if err != nil {
		http.Error(w, "Failed hashing the password", http.StatusInternalServerError)
		return
	}

	user, err := s.repo.GetUserByCreds(r.Context(), payload.Username, hashed)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	token, err := s.tokenGenerator(*user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	response := map[string]any{
		"token": token,
		"user":  user,
	}

	json.NewEncoder(w).Encode(response)
	w.WriteHeader(http.StatusOK)
}

func (s *userServiceImpl) Signup(w http.ResponseWriter, r *http.Request) {
	var payload models.SignupPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if payload.Password != payload.ConfirmPassword {
		http.Error(w, "Password and confirm password does not match", http.StatusBadRequest)
		return
	}

	if payload.Username == "" || payload.Password == "" || payload.Email == "" {
		http.Error(w, "Username and password are required", http.StatusBadRequest)
		return
	}

	hashed, err := utils.Hash(payload.Password)
	if err != nil {
		http.Error(w, "Failed hashing the password", http.StatusInternalServerError)
		return
	}

	id, err := s.repo.CreateUser(r.Context(), payload.Name, payload.Username, payload.Email, payload.AvatarUrl, hashed)
	if err != nil {
		http.Error(w, "Username or email is taken", http.StatusUnauthorized)
		return
	}

	user := models.User{
		ID: id, Name: payload.Name, Username: payload.Username,
		Email: payload.Email, AvatarUrl: payload.AvatarUrl,
	}

	token, err := s.tokenGenerator(user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	response := map[string]any{
		"token": token,
		"user":  user,
	}

	json.NewEncoder(w).Encode(response)
	w.WriteHeader(http.StatusCreated)
}

func (s *userServiceImpl) GetLoggedInUser(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		http.Error(w, "middleware not mounted", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(user)
	w.WriteHeader(http.StatusOK)
}
