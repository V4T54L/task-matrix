package migrate

import (
	"context"
	"database/sql"
	"time"
)

func MigrateSQLite(ctx context.Context, db *sql.DB) error {
	query := `
		PRAGMA foreign_keys = ON;

		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			username TEXT NOT NULL UNIQUE,
			email TEXT NOT NULL UNIQUE,
			avatar_url TEXT NOT NULL,
			password TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS statuses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS projects (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			owner_id INTEGER NOT NULL,
			title TEXT NOT NULL,
			description TEXT,
			status_id INTEGER DEFAULT 1,
			due_date DATE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			deleted_at DATETIME,
			FOREIGN KEY (owner_id) REFERENCES users(id),
			FOREIGN KEY (status_id) REFERENCES statuses(id)
		);

		CREATE TABLE IF NOT EXISTS project_members (
			project_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			PRIMARY KEY (project_id, user_id),
			FOREIGN KEY (project_id) REFERENCES projects(id),
			FOREIGN KEY (user_id) REFERENCES users(id)
		);

		CREATE TABLE IF NOT EXISTS priorities (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS tasks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			priority_id INTEGER,
			assignee_id INTEGER,
			project_id INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			status_id INTEGER,
			FOREIGN KEY (priority_id) REFERENCES priorities(id),
			FOREIGN KEY (assignee_id) REFERENCES users(id),
			FOREIGN KEY (project_id) REFERENCES projects(id),
			FOREIGN KEY (status_id) REFERENCES statuses(id)
		);
			
		-- Populate DB
		
		INSERT INTO statuses (name)
		SELECT 'TODO'
		WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'TODO');

		INSERT INTO statuses (name)
		SELECT 'In Progress'
		WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'In Progress');

		INSERT INTO statuses (name)
		SELECT 'Review'
		WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Review');

		INSERT INTO statuses (name)
		SELECT 'Completed'
		WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Completed');

		INSERT INTO priorities (name)
		SELECT 'Low'
		WHERE NOT EXISTS (SELECT 1 FROM priorities WHERE name = 'Low');

		INSERT INTO priorities (name)
		SELECT 'Medium'
		WHERE NOT EXISTS (SELECT 1 FROM priorities WHERE name = 'Medium');

		INSERT INTO priorities (name)
		SELECT 'High'
		WHERE NOT EXISTS (SELECT 1 FROM priorities WHERE name = 'High');

		INSERT INTO priorities (name)
		SELECT 'Critical'
		WHERE NOT EXISTS (SELECT 1 FROM priorities WHERE name = 'Critical');

		-- Not so releavant, only for development purpose

		INSERT INTO users (name, username, email, avatar_url, password)
		SELECT 'Alice Johnson', 'alice', 'alice@example.com', 'https://i.pravatar.cc/150?img=1', 'pass_hash'
		WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@example.com');

		INSERT INTO users (name, username, email, avatar_url, password)
		SELECT 'Bob Smith', 'bob', 'bob@example.com', 'https://i.pravatar.cc/150?img=2', 'pass_hash'
		WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob@example.com');

		INSERT INTO users (name, username, email, avatar_url, password)
		SELECT 'Carol Martinez', 'carolm', 'carol@example.com', 'https://i.pravatar.cc/150?img=3', 'pass_hash'
		WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'carol@example.com');

		INSERT INTO users (name, username, email, avatar_url, password)
		SELECT 'Dave Lee', 'dlee', 'dave@example.com', 'https://i.pravatar.cc/150?img=4', 'pass_hash'
		WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'dave@example.com');

		INSERT INTO users (name, username, email, avatar_url, password)
		SELECT 'Alice Johnson', 'alicej', 'alice@example.com', 'https://i.pravatar.cc/150?img=1', 'pass_hash'
		WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@example.com');

		INSERT INTO users (name, username, email, avatar_url, password)
		SELECT 'Bob Smith', 'bobsmith', 'bob@example.com', 'https://i.pravatar.cc/150?img=2', 'pass_hash'
		WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob@example.com');

		INSERT INTO users (name, username, email, avatar_url, password)
		SELECT 'Carol Martinez', 'carolm', 'carol@example.com', 'https://i.pravatar.cc/150?img=3', 'pass_hash'
		WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'carol@example.com');

		INSERT INTO users (name, username, email, avatar_url, password)
		SELECT 'Dave Lee', 'dlee', 'dave@example.com', 'https://i.pravatar.cc/150?img=4', 'pass_hash'
		WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'dave@example.com');

		-- Get user IDs
		WITH user_ids AS (
			SELECT id AS owner_id FROM users WHERE email = 'alice@example.com'
		)
		INSERT INTO projects (owner_id, title, description, status_id, due_date)
		SELECT owner_id, 'Bug Tracker System', 'A system for tracking software bugs and issues.', 1, '2025-12-31'
		FROM user_ids
		WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Bug Tracker System');

		WITH user_ids AS (
			SELECT id AS owner_id FROM users WHERE email = 'bob@example.com'
		)
		INSERT INTO projects (owner_id, title, description, status_id, due_date)
		SELECT owner_id, 'RESTful API Service', 'Backend API for mobile and web apps.', 1, '2025-11-15'
		FROM user_ids
		WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'RESTful API Service');

		-- Bug Tracker System: everyone
		INSERT OR IGNORE INTO project_members (project_id, user_id)
		SELECT p.id, u.id
		FROM projects p, users u
		WHERE p.title = 'Bug Tracker System';

		-- RESTful API Service: only Bob, Carol, and Dave
		INSERT OR IGNORE INTO project_members (project_id, user_id)
		SELECT p.id, u.id
		FROM projects p, users u
		WHERE p.title = 'RESTful API Service' AND u.email IN ('bob@example.com', 'carol@example.com', 'dave@example.com');

		-- Insert sample tasks
		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id, status_id)
		SELECT 
			'Fix login bug',
			'Users are unable to log in with valid credentials.',
			(SELECT id FROM priorities WHERE name = 'High'),
			(SELECT id FROM users WHERE email = 'carol@example.com'),
			(SELECT id FROM projects WHERE title = 'Bug Tracker System'),
			(SELECT id FROM statuses WHERE name = 'In Progress')
		WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Fix login bug');

		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id, status_id)
		SELECT 
			'Create user registration endpoint',
			'Implement POST /register for user signups.',
			(SELECT id FROM priorities WHERE name = 'Medium'),
			(SELECT id FROM users WHERE email = 'bob@example.com'),
			(SELECT id FROM projects WHERE title = 'RESTful API Service'),
			(SELECT id FROM statuses WHERE name = 'TODO')
		WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Create user registration endpoint');

		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id, status_id)
		SELECT 
			'Design database schema',
			'Define tables and relationships for the bug tracker.',
			(SELECT id FROM priorities WHERE name = 'Critical'),
			(SELECT id FROM users WHERE email = 'alice@example.com'),
			(SELECT id FROM projects WHERE title = 'Bug Tracker System'),
			(SELECT id FROM statuses WHERE name = 'Completed')
		WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Design database schema');

		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id, status_id)
		SELECT 
			'Write unit tests for API',
			'Cover endpoints with Jest and Supertest.',
			(SELECT id FROM priorities WHERE name = 'High'),
			(SELECT id FROM users WHERE email = 'dave@example.com'),
			(SELECT id FROM projects WHERE title = 'RESTful API Service'),
			(SELECT id FROM statuses WHERE name = 'Review')
		WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Write unit tests for API');
	`

	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	_, err := db.ExecContext(ctx, query)

	return err

}
