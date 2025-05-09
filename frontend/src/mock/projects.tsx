import type { Project } from "../types";

const getRandomProject = (id: number) => {
    const project: Project = {
        id,
        name: "Project " + id,
        description: "Complete redesign of the company website for improved UX and modern aesthetics. Focus on mobile-first approach and accessibility.",
        due_date: '2025-06-30',
        member_avatars: [
            "https://avatar.iran.liara.run/public/3",
            "https://avatar.iran.liara.run/public/13",
            "https://avatar.iran.liara.run/public/23",
            "https://avatar.iran.liara.run/public/33",
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