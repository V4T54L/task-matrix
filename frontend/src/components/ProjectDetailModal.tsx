import React from 'react';
import type { Project } from '../types';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { mockStatus } from '../mock/status';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Project) => void;
    projectToEdit?: Project;
}

type FormFields = {
    name: string;
    description: string;
    due_date: string;
    status_id: number;
}

const ProjectDetailModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormFields>({
        defaultValues: { ...projectToEdit }
    });


    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const newProject: Project = {
            id: projectToEdit?.id ?? 1,
            ...data,
            status: mockStatus.find(e => e.id == data.status_id)?.name + "",
            members: [],
            tasks_completed: 0,
            total_tasks: 0,
        };
        onSave(newProject);
        onClose();  // Close the modal after saving
        console.log("New project created: ", newProject);
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-4">
                            {projectToEdit ? 'Edit Project' : 'Create New Project'}
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

                            <div>

                                <label htmlFor="status_id" className="block text-sm font-medium text-gray-700">Status</label>

                                <select

                                    id="status_id"

                                    {...register("status_id", { valueAsNumber: true })}

                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"

                                >

                                    <option value="">Select a status</option>

                                    {mockStatus.map(status => (

                                        <option key={status.id} value={status.id}>

                                            {status.name}

                                        </option>

                                    ))}

                                </select>

                            </div>



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
