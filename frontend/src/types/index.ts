export type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar_url: string;
};

export type Project = {
    id: number;
    name: string;
    description: string;
    due_date: string;
    status: Status;
    owner: User;
    members: User[];
    tasks_completed: number;
    total_tasks: number;
};

export type Status = {
    id: number;
    name: string;
};

// Alias Member to User for consistency
export type Member = User;

export type Task = {
    id: number;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    assignee: User;
};

export type Priority = {
    id: number;
    name: string;
};

export type TaskPayload = {
    title: string;
    description: string;
    priority_id: number;
    status_id: number;
    assignee_id: number;
};

export type ProjectDetail = Project & {
    tasks: Task[];
};

export type ProjectPayload = {
    name: string;
    description: string;
    due_date: string;
    status_id: number;
};

export type SignupPayload = {
    avatar_url?: string;
    name: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
};

export type LoginPayload = {
    username: string;
    password: string;
};

export type AuthResponse = {
    token: string;
    user: User;
};

export type MessageResponse = {
    message: string;
};
