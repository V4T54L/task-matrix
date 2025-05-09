export type Project = {
    id: number
    name: string;
    description: string;
    due_date: string;
    status: string;
    member_avatars: string[];
    tasks_completed: number;
    total_tasks: number;
}
