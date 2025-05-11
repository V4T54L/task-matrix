import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { Task, Priority, Status, Member } from '../types';
import { mockPriorities } from '../mock/priorities';
import { mockTaskStatus } from '../mock/status';
import { mockProjects } from '../mock/projects';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    taskToEdit?: Task;
}

type TaskFormFields = {
    title: string;
    description: string;
    priority_id: number;
    status_id: number;
    assignee_id: number;
};

const TaskDetailModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<TaskFormFields>({
        defaultValues: { ...taskToEdit },
    });

    const onSubmit: SubmitHandler<TaskFormFields> = (data) => {
        const newTask: Task = {
            id: taskToEdit?.id ?? Date.now(), // fallback ID generator
            ...data,
        };
        onSave(newTask);
        onClose();
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-4">
                            {taskToEdit ? 'Edit Task: ' + taskToEdit.title : 'Create New Task'}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    {...register('title')}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter task title"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    {...register('description')}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter task description"
                                />
                            </div>

                            {/* Priority Dropdown */}
                            <div>
                                <label htmlFor="priority_id" className="block text-sm font-medium text-gray-700">
                                    Priority
                                </label>
                                <select
                                    id="priority_id"
                                    {...register('priority_id', { valueAsNumber: true })}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Select a priority</option>
                                    {mockPriorities.map(priority => (
                                        <option key={priority.id} value={priority.id}>
                                            {priority.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Dropdown */}
                            <div>
                                <label htmlFor="status_id" className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    id="status_id"
                                    {...register('status_id', { valueAsNumber: true })}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Select a status</option>
                                    {mockTaskStatus.map(status => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Assignee Dropdown */}
                            <div>
                                <label htmlFor="assignee_id" className="block text-sm font-medium text-gray-700">
                                    Assignee
                                </label>
                                <select
                                    id="assignee_id"
                                    {...register('assignee_id', { valueAsNumber: true })}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                >
                                    <option value={0}>Unassigned</option>
                                    {mockProjects[0].members.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                                >
                                    {taskToEdit ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default TaskDetailModal;
