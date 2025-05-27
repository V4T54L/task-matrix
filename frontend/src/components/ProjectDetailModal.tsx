import React, { useEffect } from 'react';
import type { Project, ProjectPayload } from '../types';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { mockProjectStatus } from '../mock/status';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: number, project: ProjectPayload) => void;
    projectToEdit?: Project;
}

type FormFields = {
    name: string;
    description: string;
    due_date: string;
    status_id: number;
}

const ProjectDetailModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormFields>({});


    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        onSave(projectToEdit ? projectToEdit.id : 0, data);
        // console.log(data)
        onClose();  // Close the modal after saving
    };

    useEffect(() => {
        if (projectToEdit) {
            reset({
                description: projectToEdit.description,
                due_date: new Date(projectToEdit.due_date).toISOString().split("T")[0],
                name: projectToEdit.name,
                status_id: projectToEdit.status.id,
            })
        } else {
            reset({
                description: "", due_date: new Date(Date.now()).toISOString().split("T")[0],
                name: "", status_id: 1,
            })
        }

    }, [projectToEdit, reset])

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-4">
                            {projectToEdit ? 'Edit Project: ' + projectToEdit.name : 'Create New Project'}
                        </h2>

                        <div className="space-y-4">
                            {/* Project Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter project name"
                                />
                            </div>

                            {/* Project Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    id="description"
                                    {...register("description")}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter project description"
                                />
                            </div>

                            {/* Due Date */}
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    {...register("due_date")}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Status Dropdown */}

                            {
                                projectToEdit &&
                                (

                                    <div>

                                        <label htmlFor="status_id" className="block text-sm font-medium text-gray-700">Status</label>

                                        <select

                                            id="status_id"

                                            {...register("status_id", { valueAsNumber: true })}

                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"

                                        >

                                            <option value="">Select a status</option>

                                            {mockProjectStatus.map(status => (

                                                <option key={status.id} value={status.id}>

                                                    {status.name}

                                                </option>

                                            ))}

                                        </select>

                                    </div>

                                )
                            }


                            {/* Action Buttons */}
                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={onClose}
                                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={handleSubmit(onSubmit)}
                                    className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
                                >
                                    {projectToEdit ? 'Save Changes' : 'Create Project'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectDetailModal;
