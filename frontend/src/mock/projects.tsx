import type { Project } from "../types";

const getRandomProject = (id: number) => {
    const project: Project = {
        id,
        name: "Project " + id,
        description: "Complete redesign of the company website for improved UX and modern aesthetics. Focus on mobile-first approach and accessibility.",
        due_date: '2025-06-30',
        members: [
            { avatar_url: "https://avatar.iran.liara.run/public/3", id: 1, name: "User One" },
            { avatar_url: "https://avatar.iran.liara.run/public/13", id: 2, name: "User Two" },
            { avatar_url: "https://avatar.iran.liara.run/public/23", id: 3, name: "User Three" },
            { avatar_url: "https://avatar.iran.liara.run/public/33", id: 4, name: "User Four" },
        ],
        status: "In Progress",
        tasks_completed: 5,
        total_tasks: 8,
    }

    return project
}

export const mockProjects: Project[] = [
    getRandomProject(1),
    getRandomProject(2),
    getRandomProject(3),
    getRandomProject(4),
    getRandomProject(5),
    getRandomProject(6),
    getRandomProject(7),

    getRandomProject(11),
    getRandomProject(12),
    getRandomProject(13),
    getRandomProject(14),
    getRandomProject(15),
    getRandomProject(16),
    getRandomProject(17),
]