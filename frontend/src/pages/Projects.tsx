import { CirclePlus } from "lucide-react"
import { Button } from "../components/ui/Button"
import ProjectCard from "../components/ProjectCard"
import { mockProjects } from "../mock/projects"
import ProjectModal from "../components/ProjectDetailModal"
import { useState } from "react"
import ProjectMembersModal from "../components/forms/ProjectMembersModal"

const Projects = () => {
    const [IsDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)
    const [IsMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false)
    return (
        <>
            <div className="flex items-center mb-8">
                <div className="flex-1">
                    <h1 className="text-4xl font-semibold text-primary my-2">Projects</h1>
                    <h2 className="text-md text-primary/80">Manage all your ongoing and completed projects.</h2>
                </div>

                <Button onClick={() => setIsDetailModalOpen(true)}>
                    <CirclePlus size={16} className="mr-4" />
                    Create Project
                </Button>
            </div>

            <div className="grid grid-col grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                {
                    mockProjects &&
                    mockProjects.map(e => (
                        <ProjectCard key={e.name} {...e}
                            onDelete={() => { }} onEdit={() => { setIsDetailModalOpen(true) }} onViewMembers={() => { setIsMembersModalOpen(true) }} onViewBoard={() => { }} />
                    ))
                }
            </div>


            <ProjectModal
                isOpen={IsDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onSave={() => { }}
                projectToEdit={undefined}
            />

            <ProjectMembersModal
                existingMembers={mockProjects[0].members}
                isOpen={IsMembersModalOpen}
                onClose={() => { setIsMembersModalOpen(false) }}
                onSave={() => { }}
            />

        </>
    )
}

export default Projects