import { CirclePlus } from "lucide-react"
import { Button } from "../components/ui/Button"
import ProjectCard from "../components/ProjectCard"
import ProjectModal from "../components/ProjectDetailModal"
import { useEffect, useState } from "react"
import ProjectMembersModal from "../components/ProjectMembersModal"
import { useNavigate } from "react-router-dom"
import type { Project, ProjectPayload } from "../types"
import { getErrorString } from "../utils"
import { addProjectMember, createProject, deleteProject, getProjects, removeProjectMember, updateProject } from "../api/projects"

const Projects = () => {
    const [IsDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)
    const [IsMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false)
    const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
    const [projects, setProjects] = useState<Project[]>([])
    const currentProject = projects.find(p => p.id === currentProjectId) || null;
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const viewBoard = (id: number) => {
        navigate(`${id}`)
    }

    const openEditModal = (projectId: number) => {
        setError("")
        const project = projects.find(e => e.id == projectId);
        setCurrentProjectId(project ? project.id : null);
        setIsDetailModalOpen(true);
    }

    const closeEditModal = () => {
        setCurrentProjectId(null);
        setIsDetailModalOpen(false);
    }

    const openMembersModal = (projectId: number) => {
        setError("")
        const project = projects.find(e => e.id == projectId);
        setCurrentProjectId(project ? project.id : null);
        setIsMembersModalOpen(true);
    }

    const closeMembersModal = () => {
        setCurrentProjectId(null);
        setIsMembersModalOpen(false);
    }

    const fetchProjects = async () => {
        setError("")
        try {
            const userProjects = await getProjects();
            setProjects(userProjects)
        } catch (error) {
            setError(getErrorString(error));
        }
    }

    const EditProject = async (id: number, project: ProjectPayload) => {
        setError("")
        try {
            if (id > 0) {
                const prevProject = projects.find(e => e.id === id);
                if (!prevProject) return;

                if (
                    project.description === prevProject.description && project.due_date === prevProject.due_date &&
                    project.name === prevProject.name && project.status_id === prevProject.status.id
                ) {
                    // no change
                    return;
                }

                const updatedProject = await updateProject(id, project);
                setProjects(prev =>
                    prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
                );
            } else {
                const newProject = await createProject(project);
                setProjects(prev => [...prev, newProject]);
            }
        } catch (error) {
            setError(getErrorString(error));
        }
    };

    const DeleteProject = async (id: number) => {
        setError("")
        try {
            await deleteProject(id);
            setProjects(prev =>
                prev.filter(p => (p.id !== id))
            );
        } catch (error) {
            setError(getErrorString(error));
        }
    };


    const AddMember = async (username: string) => {
        setError("")
        const project = projects.find(p => p.id === currentProjectId);
        if (!project) return;

        try {
            const user = await addProjectMember(project.id, username);

            setProjects(prev =>
                prev.map(p =>
                    p.id !== project.id
                        ? p
                        : { ...p, members: [...p.members, user] }
                )
            );
        } catch (error) {
            setError(getErrorString(error));
        }
    };


    const RemoveMember = async (userId: number) => {
        setError("")
        const project = projects.find(p => p.id === currentProjectId);
        if (!project) return;

        try {
            await removeProjectMember(project.id, userId);

            setProjects(prev =>
                prev.map(p =>
                    p.id !== project.id
                        ? p
                        : {
                            ...p,
                            members: p.members.filter(member => member.id !== userId)
                        }
                )
            );
        } catch (error) {
            setError(getErrorString(error));
        }
    };


    useEffect(() => {
        fetchProjects();
    }, [])

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

            {error && <p className="text-center font-semi-bold text-red-500 bg-red-100 border-2 border-red-500 rounded-lg">{error}</p>}

            {
                projects ? (
                    <div className="grid grid-col grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {
                            projects.map(e => (
                                <ProjectCard key={e.id} {...e}
                                    onDelete={() => { DeleteProject(e.id) }} onEdit={() => { openEditModal(e.id) }} onViewMembers={() => { openMembersModal(e.id) }} onViewBoard={() => viewBoard(e.id)} />
                            ))
                        }
                    </div>
                ) : (
                    <h1 className="mt-8 text-center text-xl text-primary/50">No projects, Create one?</h1>
                )
            }


            <ProjectModal
                isOpen={IsDetailModalOpen}
                onClose={() => closeEditModal()}
                onSave={EditProject}
                projectToEdit={projects.find(p => p.id === currentProjectId)}
            />

            <ProjectMembersModal
                members={currentProject ? currentProject.members : []}
                isOpen={IsMembersModalOpen}
                onClose={closeMembersModal}
                onAddMember={AddMember}
                onRemoveMember={RemoveMember}
            // TODO: Propogate error
            />

        </>
    )
}

export default Projects