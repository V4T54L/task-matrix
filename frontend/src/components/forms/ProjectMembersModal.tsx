import React, { useState } from 'react';
import type { Member } from '../../types';

interface MembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (members: Member[]) => void;
    existingMembers: Member[];
}

const ProjectMembersModal: React.FC<MembersModalProps> = ({ isOpen, onClose, onSave, existingMembers }) => {
    const [members, setMembers] = useState<Member[]>(existingMembers);
    const [newMemberName, setNewMemberName] = useState('');

    const handleAddMember = () => {
        if (!newMemberName.trim()) return;
        const newMember: Member = {
            id: Date.now(),
            name: newMemberName.trim(),
            avatar_url: `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(newMemberName.trim())}`
        };
        setMembers([...members, newMember]);
        setNewMemberName('');
    };

    const handleDeleteMember = (id: number) => {
        setMembers(members.filter(member => member.id !== id));
    };

    const handleSave = () => {
        onSave(members);
        onClose();
    };

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
                                onClick={() => handleDeleteMember(member.id)}
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
                        placeholder="Enter member name"
                        className="flex-1 border border-gray-300 p-2 rounded-md"
                    />
                    <button
                        onClick={handleAddMember}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                    >
                        Save Members
                    </button>
                </div>
            </div>
        </div>
    ) : null;
};

export default ProjectMembersModal;
