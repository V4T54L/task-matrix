import React, { useState, useEffect } from 'react';
import type { Project } from '../types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Project) => void;
    projectToEdit?: Project;  // Optional prop to pre-fill the form (for edit mode)
}

const ProjectModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [memberAvatars, setMemberAvatars] = useState<string[]>([]);
    const [tasksCompleted, setTasksCompleted] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);

    // If we are in edit mode, pre-fill the form fields
    useEffect(() => {
        if (projectToEdit) {
            setName(projectToEdit.name);
            setDescription(projectToEdit.description);
            setDueDate(projectToEdit.due_date);
            setMemberAvatars(projectToEdit.member_avatars);
            setTasksCompleted(projectToEdit.tasks_completed);
            setTotalTasks(projectToEdit.total_tasks);
        }
    }, [projectToEdit]);

    const handleSubmit = () => {
        const newProject: Project = {
            id:1,
            status:"In Progress",
            name,
            description,
            due_date: dueDate,
            member_avatars: memberAvatars,
            tasks_completed: tasksCompleted,
            total_tasks: totalTasks,
        };
        onSave(newProject);
        onClose();  // Close the modal after saving
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
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter project name"
                                />
                            </div>

                            {/* Project Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
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
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Member Avatars */}
                            <div>
                                <label htmlFor="memberAvatars" className="block text-sm font-medium text-gray-700">Member Avatars</label>
                                <input
                                    type="text"
                                    id="memberAvatars"
                                    value={memberAvatars.join(', ')}  // Display comma-separated avatars
                                    onChange={(e) => setMemberAvatars(e.target.value.split(', ').map(avatar => avatar.trim()))}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter member avatars URLs (comma separated)"
                                />
                            </div>

                            {/* Tasks Completed / Total Tasks */}
                            <div className="flex space-x-4">
                                <div className="w-full">
                                    <label htmlFor="tasksCompleted" className="block text-sm font-medium text-gray-700">Tasks Completed</label>
                                    <input
                                        type="number"
                                        id="tasksCompleted"
                                        value={tasksCompleted}
                                        onChange={(e) => setTasksCompleted(Number(e.target.value))}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        placeholder="Tasks completed"
                                    />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="totalTasks" className="block text-sm font-medium text-gray-700">Total Tasks</label>
                                    <input
                                        type="number"
                                        id="totalTasks"
                                        value={totalTasks}
                                        onChange={(e) => setTotalTasks(Number(e.target.value))}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        placeholder="Total tasks"
                                    />
                                </div>
                            </div>
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
                                onClick={handleSubmit}
                                className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
                            >
                                {projectToEdit ? 'Save Changes' : 'Create Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectModal;
