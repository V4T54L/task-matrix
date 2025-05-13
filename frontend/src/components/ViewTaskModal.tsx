import React from 'react';
import type { Member, Task } from '../types';
import { mockPriorities } from '../mock/priorities';
import { mockTaskStatus } from '../mock/status';

type ViewTaskModalProps = {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    members: Member[];
};

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, isOpen, onClose, members }) => {
    if (!isOpen || !task) return null;

    const priority = mockPriorities.find(p => p.id === task.priority.id)?.name || 'Unknown';
    const status = mockTaskStatus.find(s => s.id === task.status.id)?.name || 'Unknown';
    const assignee = members.find(m => m.id === task.assignee.id);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Task Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-lg">×</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <div className="text-gray-900 mt-1">{task.title}</div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <div className="text-gray-900 mt-1 whitespace-pre-line">{task.description}</div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Priority</label>
                        <div className="text-gray-900 mt-1">{priority}</div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="text-gray-900 mt-1">{status}</div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Assignee</label>
                        <div className="flex items-center gap-2 mt-1">
                            {assignee ? (
                                <>
                                    <img
                                        src={assignee.avatar_url}
                                        alt={assignee.name}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-gray-900">{assignee.name}</span>
                                </>
                            ) : (
                                <span className="text-gray-500 italic">Unassigned</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewTaskModal;
