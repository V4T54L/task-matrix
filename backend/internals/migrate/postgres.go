package migrate

import (
	"context"
	"database/sql"
	"time"
)

func MigratePostgres(ctx context.Context, db *sql.DB) error {
	mainQuery := `
		-- ===============================
		-- 📦 SCHEMA DEFINITIONS
		-- ===============================

		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			username TEXT NOT NULL UNIQUE,
			email TEXT NOT NULL UNIQUE,
			avatar_url TEXT NOT NULL,
			password TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS statuses (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL UNIQUE
		);

		CREATE TABLE IF NOT EXISTS priorities (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL UNIQUE
		);

		CREATE TABLE IF NOT EXISTS projects (
			id SERIAL PRIMARY KEY,
			owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			description TEXT,
			status_id INTEGER NOT NULL DEFAULT 1 REFERENCES statuses(id),
			due_date DATE,
			created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMPTZ
		);

		CREATE TABLE IF NOT EXISTS project_members (
			project_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			PRIMARY KEY (project_id, user_id),
			FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS tasks (
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			priority_id INTEGER NOT NULL REFERENCES priorities(id),
			assignee_id INTEGER NOT NULL REFERENCES users(id),
			project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
			status_id INTEGER NOT NULL REFERENCES statuses(id)
		);

		-- ===============================
		-- 🔢 STATIC DATA (STATUSES / PRIORITIES)
		-- ===============================

		INSERT INTO statuses (name)
		SELECT unnest(ARRAY['TODO', 'In Progress', 'Review', 'Completed'])
		ON CONFLICT DO NOTHING;

		INSERT INTO priorities (name)
		SELECT unnest(ARRAY['Low', 'Medium', 'High', 'Critical'])
		ON CONFLICT DO NOTHING;`

	devQuery := `
		-- ===============================
		-- 👤 USER SEEDING
		-- ===============================

		INSERT INTO users (name, username, email, avatar_url, password)
		VALUES 
			('Alice Johnson', 'alice', 'alice@example.com', 'https://i.pravatar.cc/150?img=1', 'pass_hash'),
			('Bob Smith', 'bob', 'bob@example.com', 'https://i.pravatar.cc/150?img=2', 'pass_hash'),
			('Carol Martinez', 'carolm', 'carol@example.com', 'https://i.pravatar.cc/150?img=3', 'pass_hash'),
			('Dave Lee', 'dlee', 'dave@example.com', 'https://i.pravatar.cc/150?img=4', 'pass_hash')
		ON CONFLICT (email) DO NOTHING;

		-- ===============================
		-- 📁 PROJECTS
		-- ===============================

		WITH user_lookup AS (
			SELECT email, id FROM users
		),
		insert1 AS (
			INSERT INTO projects (owner_id, title, description, status_id, due_date)
			SELECT u.id, 'Bug Tracker System', 'A system for tracking software bugs and issues.', 
				(SELECT id FROM statuses WHERE name = 'TODO'), '2025-12-31'
			FROM user_lookup u WHERE u.email = 'alice@example.com'
			AND NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Bug Tracker System')
			RETURNING id, title
		),
		insert2 AS (
			INSERT INTO projects (owner_id, title, description, status_id, due_date)
			SELECT u.id, 'RESTful API Service', 'Backend API for mobile and web apps.', 
				(SELECT id FROM statuses WHERE name = 'TODO'), '2025-11-15'
			FROM user_lookup u WHERE u.email = 'bob@example.com'
			AND NOT EXISTS (SELECT 1 FROM projects WHERE title = 'RESTful API Service')
			RETURNING id, title
		)
		SELECT 1;

		-- ===============================
		-- 👥 PROJECT MEMBERS
		-- ===============================

		-- Bug Tracker: all users
		-- INSERT INTO project_members (project_id, user_id)
		-- SELECT p.id, u.id
		-- FROM projects p
		-- JOIN users u ON TRUE
		-- WHERE p.title = 'Bug Tracker System'
		-- ON CONFLICT DO NOTHING;

		-- RESTful API: Bob, Carol, Dave
		INSERT INTO project_members (project_id, user_id)
		SELECT p.id, u.id
		FROM projects p
		JOIN users u ON u.email IN ('bob@example.com', 'carol@example.com', 'dave@example.com')
		WHERE p.title = 'RESTful API Service'
		ON CONFLICT DO NOTHING;

		-- ===============================
		-- ✅ TASKS
		-- ===============================

		WITH
			priorities AS (
				SELECT name, id FROM priorities
			),
			statuses AS (
				SELECT name, id FROM statuses
			),
			users AS (
				SELECT email, id FROM users
			),
			projects AS (
				SELECT title, id FROM projects
			)

		-- Task 1
		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id, status_id)
		SELECT
			'Fix login bug',
			'Users are unable to log in with valid credentials.',
			(SELECT id FROM priorities WHERE name = 'High'),
			(SELECT id FROM users WHERE email = 'carol@example.com'),
			(SELECT id FROM projects WHERE title = 'Bug Tracker System'),
			(SELECT id FROM statuses WHERE name = 'In Progress')
		WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Fix login bug');

		-- Task 2
		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id, status_id)
		SELECT
			'Create user registration endpoint',
			'Implement POST /register for user signups.',
			(SELECT id FROM priorities WHERE name = 'Medium'),
			(SELECT id FROM users WHERE email = 'bob@example.com'),
			(SELECT id FROM projects WHERE title = 'RESTful API Service'),
			(SELECT id FROM statuses WHERE name = 'TODO')
		WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Create user registration endpoint');

		-- Task 3
		INSERT INTO tasks (title, description, priority_id, assignee_id, project_id, status_id)
		SELECT
			'Design database schema',
			'Define tables and relationships for the bug tracker.',
			(SELECT id FROM priorities WHERE name = 'Critical'),
			(SELECT id FROM users WHERE email = 'alice@example.com'),
			(SELECT id FROM projects WHERE title = 'Bug Tracker System'),
			(SELECT id FROM statuses WHERE name = 'Completed')
		WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Design database schema');

		-- Task 4
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

	query := mainQuery
	_ = devQuery // skipping seeeding the database for prod
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	_, err := db.ExecContext(ctx, query)

	return err

}
