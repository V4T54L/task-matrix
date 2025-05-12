package models

type SignupPayload struct {
	AvatarUrl       string `json:"avatar_url"`
	Name            string `json:"name"`
	Username        string `json:"username"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
}

type LoginPayload struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type ProjectPayload struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	DueDate     string `json:"due_date"`
	StatusID    int    `json:"status_id"`
}

type TaskPayload struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	PriorityID  int    `json:"priority_id"`
	StatusID    int    `json:"status_id"`
	AssigneeID  int    `json:"assignee_id"`
}
