export type User = {
    id: number;
    name: string;
};

export type Project = {
    id: number
    name: string;
    description: string;
    due_date: string;
    status: string;
    members: Member[];
    tasks_completed: number;
    total_tasks: number;
}

export type Status = {
    id: number;
    name: string;
}

export type Member = {
    id: number,
    name: string,
    avatar_url: string,
}

export type Task = {
    id: number,
    title: string,
    description: string,
    priority_id: number,
    status_id: number,
    assignee_id: number,
}

export type Priority = {
    id: number,
    name: string,
}