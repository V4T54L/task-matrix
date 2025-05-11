import { CirclePlus } from "lucide-react"
import { Button } from "../components/ui/Button"
import ProjectCard from "../components/ProjectCard"
import { mockProjects } from "../mock/projects"
import ProjectModal from "../components/ProjectDetailModal"
import { useRef, useState } from "react"
import ProjectMembersModal from "../components/ProjectMembersModal"
import { useNavigate } from "react-router-dom"
import type { Project } from "../types"

const Projects = () => {
    const [IsDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)
    const [IsMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false)
    const currentProject = useRef<Project | undefined>(undefined)
    const navigate = useNavigate()
    const viewBoard = (id: number) => {
        navigate(`${id}`)
    }

    const openEditModal = (projectId: number) => {
        const project = mockProjects.find(e => e.id == projectId)
        currentProject.current = project
        setIsDetailModalOpen(true)
    }

    const closeEditModal = () => {
        currentProject.current = undefined
        setIsDetailModalOpen(false)
    }

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8">
                <div className="flex-1">
                    <h1 className="text-4xl font-semibold text-primary my-2">Projects</h1>
                    <h2 className="text-md text-primary/80">Manage all your ongoing and completed projects.</h2>
                </div>

                <Button onClick={() => openEditModal(-1)}>
                    <CirclePlus size={16} className="mr-4" />
                    Create Project
                </Button>
            </div>

            <div className="grid grid-col grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                {
                    mockProjects &&
                    mockProjects.map(e => (
                        <ProjectCard key={e.name} {...e}
                            onDelete={() => { }} onEdit={() => { openEditModal(e.id) }} onViewMembers={() => { setIsMembersModalOpen(true) }} onViewBoard={() => viewBoard(e.id)} />
                    ))
                }
            </div>


            <ProjectModal
                isOpen={IsDetailModalOpen}
                onClose={() => closeEditModal()}
                onSave={() => { }}
                projectToEdit={currentProject.current}
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