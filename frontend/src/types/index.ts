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