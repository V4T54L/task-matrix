import { ArrowLeftCircle } from "lucide-react"
import { Button } from "../components/ui/Button"
import { useParams } from "react-router-dom"
import { mockProjects } from "../mock/projects";
import type { Project } from "../types";
import TeamKanbanBoard from "../components/KanbanBoard";
import { mockTasks } from "../mock/tasks";

const ProjectBoard = () => {
    const { id } = useParams();
    const currentProject: Project | undefined = mockProjects.find(e => id && e.id == parseInt(id))

    if (!currentProject) {
        return <>
            Project not found
        </>
    }

    return (
        <>
            <Button variant="ghost" className="font-normal flex gap-2">
                <ArrowLeftCircle />
                <h3>
                    Back to projects
                </h3>
            </Button>

            <h1 className="text-3xl font-bold mt-8">{currentProject.name}</h1>
            <h2 className="font-light mb-8">{currentProject.description}</h2>

            <TeamKanbanBoard members={currentProject.members} tasks={mockTasks} />
        </>
    )
}

export default ProjectBoard