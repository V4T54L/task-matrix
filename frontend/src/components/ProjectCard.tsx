import React from 'react';
import type { Project } from '../types';

// Define types for the props
interface ProjectCardProps extends Project {
    onEdit: () => void;
    onDelete: () => void;
    onViewMembers: () => void;
    onViewBoard: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    name,
    description,
    due_date,
    status,
    members,
    tasks_completed,
    total_tasks,
    onEdit,
    onDelete,
    onViewMembers,
    onViewBoard,
}) => {
    // Calculate the progress percentage
    const progress = (tasks_completed / total_tasks) * 100;

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 w-full">
            {/* Project Name and Due Date */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">{name}</h3>
                <span className="text-sm text-gray-500">{new Date(due_date).toLocaleDateString()}</span>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-4">{description}</p>

            {/* Member Avatars */}
            <div className="flex -space-x-2 mb-4">
                {members.slice(0, 4).map((member, index) => (
                    <img
                        key={index}
                        src={member.avatar_url}
                        alt={`Member ${index + 1}`}
                        className="w-8 h-8 rounded-full border-2 border-white"
                    />
                ))}
                {members.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
                        +{members.length - 4}
                    </div>
                )}
            </div>

            {/* Progress */}
            <div className="mb-4">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tasks Completed</span>
                    <span className="text-sm font-semibold">{tasks_completed} / {total_tasks}</span>
                </div>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                            {status}
                        </span>
                    </div>
                    <div className="flex mb-2">
                        <div className="w-full bg-gray-200 rounded-full">
                            <div
                                className="bg-teal-600 text-xs leading-none py-1 text-center text-white rounded-full"
                                style={{ width: `${progress}%` }}
                            >
                                {progress.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2">
                <button
                    onClick={onEdit}
                    className="text-teal-600 hover:text-teal-800 text-sm font-semibold"
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                    Delete
                </button>
                <button
                    onClick={onViewMembers}
                    className="text-orange-600 hover:text-orange-800 text-sm font-semibold"
                >
                    View Members
                </button>
                <button
                    onClick={onViewBoard}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                    View Board
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
