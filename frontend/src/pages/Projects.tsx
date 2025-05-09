import { CirclePlus } from "lucide-react"
import { Button } from "../components/ui/Button"
import ProjectCard from "../components/ProjectCard"
import { mockProjects } from "../mock/projects"
import ProjectModal from "../components/ProjectModal"
import { useState } from "react"

const Projects = () => {
    const [IsOpen, setIsOpen] = useState<boolean>(false)
    return (
        <>
            <div className="flex items-center mb-8">
                <div className="flex-1">
                    <h1 className="text-4xl font-semibold text-primary my-2">Projects</h1>
                    <h2 className="text-md text-primary/80">Manage all your ongoing and completed projects.</h2>
                </div>

                <Button onClick={() => setIsOpen(true)}>
                    <CirclePlus size={16} className="mr-4" />
                    Create Project
                </Button>
            </div>

            <div className="grid grid-col grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                {
                    mockProjects &&
                    mockProjects.map(e => (
                        <ProjectCard key={e.name} {...e}
                            onDelete={() => { }} onEdit={() => { }} onView={() => { }} />
                    ))
                }
            </div>


            <ProjectModal
                isOpen={IsOpen}
                onClose={() => setIsOpen(false)}
                onSave={() => { }}
                projectToEdit={undefined}
            />

        </>
    )
}

export default Projects