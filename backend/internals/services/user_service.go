package services

import (
	"encoding/json"
	"log"
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
		log.Printf("[ERROR] [Login] Failed to decode payload: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if payload.Username == "" || payload.Password == "" {
		log.Printf("[WARN] [Login] Missing username or password")
		http.Error(w, "Username and password are required", http.StatusBadRequest)
		return
	}

	hashed, err := utils.Hash(payload.Password)
	if err != nil {
		log.Printf("[ERROR] [Login] Failed to hash password for user %s: %v", payload.Username, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	user, err := s.repo.GetUserByCreds(r.Context(), payload.Username, hashed)
	if err != nil {
		log.Printf("[WARN] [Login] Invalid credentials for user %s", payload.Username)
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	token, err := s.tokenGenerator(*user)
	if err != nil {
		log.Printf("[ERROR] [Login] Token generation failed for user ID %d: %v", user.ID, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] [Login] User %s (ID %d) logged in successfully", user.Username, user.ID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"token": token,
		"user":  user,
	})
}

func (s *userServiceImpl) Signup(w http.ResponseWriter, r *http.Request) {
	var payload models.SignupPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Printf("[ERROR] [Signup] Failed to decode payload: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if payload.Password != payload.ConfirmPassword {
		log.Printf("[WARN] [Signup] Passwords do not match for user: %s", payload.Username)
		http.Error(w, "Passwords do not match", http.StatusBadRequest)
		return
	}

	if payload.Username == "" || payload.Password == "" || payload.Email == "" {
		log.Printf("[WARN] [Signup] Missing required fields: username/email/password")
		http.Error(w, "Required fields missing", http.StatusBadRequest)
		return
	}

	hashed, err := utils.Hash(payload.Password)
	if err != nil {
		log.Printf("[ERROR] [Signup] Failed to hash password for user %s: %v", payload.Username, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	id, err := s.repo.CreateUser(r.Context(), payload.Name, payload.Username, payload.Email, payload.AvatarUrl, hashed)
	if err != nil {
		log.Printf("[WARN] [Signup] Username/email already in use: %s / %s", payload.Username, payload.Email)
		http.Error(w, "Username or email is already taken", http.StatusConflict)
		return
	}

	user := models.User{
		ID: id, Name: payload.Name, Username: payload.Username,
		Email: payload.Email, AvatarUrl: payload.AvatarUrl,
	}

	token, err := s.tokenGenerator(user)
	if err != nil {
		log.Printf("[ERROR] [Signup] Token generation failed for user ID %d: %v", user.ID, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] [Signup] User created successfully: %s (ID %d)", user.Username, user.ID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"token": token,
		"user":  user,
	})
}

func (s *userServiceImpl) GetLoggedInUser(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middlewares.UserContextKey).(models.User)
	if !ok {
		log.Printf("[ERROR] [GetLoggedInUser] Middleware context missing")
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	log.Printf("[INFO] [GetLoggedInUser] Returning user: %s (ID %d)", user.Username, user.ID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}
