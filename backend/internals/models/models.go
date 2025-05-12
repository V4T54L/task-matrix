package models

type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Username  string `json:"username"`
	AvatarUrl string `json:"avatar_url"`
}

type Status struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Priority struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Project struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	DueDate        string `json:"due_date"`
	Status         Status `json:"status"`
	Owner          User   `json:"owner"`
	Members        []User `json:"members"`
	TasksCompleted int    `json:"tasks_completed"`
	TotalTasks     int    `json:"total_tasks"`
}

type Task struct {
	ID          int      `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Priority    Priority `json:"priority"`
	Status      string   `json:"status"`
	Assignee    User     `json:"assignee"`
}

type ProjectDetail struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	DueDate     string `json:"due_date"`
	Status      Status `json:"status"`
	Owner       User   `json:"owner"`
	Members     []User `json:"members"`
	Tasks       []Task `json:"tasks"`
}
