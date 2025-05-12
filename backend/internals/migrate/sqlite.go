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
			FOREIGN KEY (priority_id) REFERENCES priorities(id),
			FOREIGN KEY (assignee_id) REFERENCES users(id),
			FOREIGN KEY (project_id) REFERENCES projects(id)
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
	`

	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	_, err := db.ExecContext(ctx, query)

	return err

}
