import React, { useState } from 'react';
import type { Member } from '../types';

interface MembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMember: (username: string) => void;
    onRemoveMember: (userId: number) => void;
    members: Member[];
}

const ProjectMembersModal: React.FC<MembersModalProps> = ({ isOpen, onClose, onAddMember, onRemoveMember, members }) => {
    const [newMemberName, setNewMemberName] = useState('');

    return isOpen ? (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-full max-w-lg shadow-xl">
                <h2 className="text-2xl font-semibold mb-2">Manage Project Members</h2>
                <p className="text-gray-600 mb-4">Add or remove members from the project.</p>

                {/* Scrollable Member List */}
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 mb-4">
                    {members.length === 0 && <p className="text-gray-500 italic">No members yet.</p>}
                    {members.map(member => (
                        <div key={member.id} className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                                <img
                                    src={member.avatar_url}
                                    alt={member.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span>{member.name}</span>
                            </div>
                            <button
                                onClick={() => onRemoveMember(member.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Member Input */}
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Enter username"
                        className="flex-1 border border-gray-300 p-2 rounded-md"
                    />
                    <button
                        onClick={() => { onAddMember(newMemberName); setNewMemberName("") }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>

                {/* Action Buttons */}
                <button
                    onClick={onClose}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                    Cancel
                </button>

            </div>
        </div>
    ) : null;
};

export default ProjectMembersModal;
