import { ArrowLeftCircle } from "lucide-react"
import { Button } from "../components/ui/Button"
import { useNavigate, useParams } from "react-router-dom"
import type { ProjectDetail } from "../types";
import TeamKanbanBoard from "../components/KanbanBoard";
import { useEffect, useState } from "react";
import { getProjectDetail } from "../api/projects";
import { getErrorString } from "../utils";

const ProjectBoard = () => {
    const { id } = useParams();
    const [project, setProject] = useState<ProjectDetail>();
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const fetchProjectDetail = async () => {
        if (!id) return;
        setError("")

        const projectId = parseInt(id)
        if (!projectId) return;
        try {
            const p = await getProjectDetail(projectId);
            setProject(p)
        } catch (error) {
            setError(getErrorString(error));
        }
    }

    useEffect(() => {
        fetchProjectDetail()
    }, [id])

    useEffect(() => {
        if (error) {
            console.error(error)
        }
    }, [error])

    return (
        <>
            <Button variant="ghost" className="font-normal flex gap-2"
                onClick={() => navigate("/projects")}
            >
                <ArrowLeftCircle />
                <h3>
                    Back to projects
                </h3>
            </Button>

            {
                !project ? (
                    <p className="mt-12 text-xl">Project</p>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mt-8">{project.name}</h1 >
                        <h2 className="font-light mb-8">{project.description}</h2>

                        <TeamKanbanBoard members={project.members ? project.members : []} tasks={project.tasks ? project.tasks : []}
                            projectId={project.id} />
                    </>
                )
            }
        </>
    )
}

export default ProjectBoard