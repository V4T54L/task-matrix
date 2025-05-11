import React, { useRef, useState } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from '@hello-pangea/dnd';
import type { Member, Status, Task, Priority } from '../types';
import { mockTaskStatus } from '../mock/status';
import { mockPriorities } from '../mock/priorities';
import { Button } from './ui/Button';
import TaskDetailModal from './TaskDetailModal';
import { Eye, Pen, Trash } from 'lucide-react';
import ViewTaskModal from './ViewTaskModal';

type TeamKanbanBoardProps = {
    tasks: Task[],
    members: Member[],
}

const TeamKanbanBoard: React.FC<TeamKanbanBoardProps> = ({ members, tasks }) => {
    const [items, setItems] = useState<Task[]>(tasks);
    const [statuses] = useState<Status[]>(mockTaskStatus);
    const [priorities] = useState<Priority[]>(mockPriorities);
    const [IsTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const currentTask = useRef<Task | undefined>(undefined)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isViewModalOpen, setViewModalOpen] = useState(false);

    const handleViewTask = (task: Task) => {
        setSelectedTask(task);
        setViewModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };



    const getPriority = (id: number) => priorities.find(p => p.id === id);

    const getPriorityColor = (name: string) => {
        switch (name.toLowerCase()) {
            case 'high':
                return 'bg-red-500 text-white';
            case 'medium':
                return 'bg-yellow-500 text-white';
            case 'low':
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleDeleteTask = (taskId: number) => {
        setItems(prev => prev.filter(task => task.id !== taskId));
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const itemToMove = items.find(i => i.id.toString() === draggableId);
        if (!itemToMove) {
            console.error("Could not find item to move:", draggableId);
            return;
        }

        const [destAssigneeId, destStatusId] = destination.droppableId.split('--');

        let newItems = Array.from(items);

        if (source.droppableId === destination.droppableId) {
            const cellItems = newItems.filter(
                item => item.assignee_id.toString() === destAssigneeId && item.status_id.toString() === destStatusId
            );
            const [reorderedItem] = cellItems.splice(source.index, 1);
            cellItems.splice(destination.index, 0, reorderedItem);

            const otherItems = newItems.filter(
                item => !(item.assignee_id.toString() === destAssigneeId && item.status_id.toString() === destStatusId)
            );

            newItems = [...otherItems, ...cellItems];

        } else {
            const updatedMovedItem = {
                ...itemToMove,
                assignee_id: parseInt(destAssigneeId, 10),
                status_id: parseInt(destStatusId, 10),
            };

            newItems = newItems.filter(item => item.id.toString() !== draggableId);

            const itemsInDestCell = newItems.filter(
                item => item.assignee_id.toString() === destAssigneeId && item.status_id.toString() === destStatusId
            );
            itemsInDestCell.splice(destination.index, 0, updatedMovedItem);

            const itemsNotInDestCell = newItems.filter(
                item => !(item.assignee_id.toString() === destAssigneeId && item.status_id.toString() === destStatusId)
            );

            newItems = [...itemsNotInDestCell, ...itemsInDestCell];
        }

        setItems(newItems);
    };


    const openEditModal = (projectId: number) => {
        const task = items.find(e => e.id == projectId)
        currentTask.current = task
        setIsTaskModalOpen(true)
    }

    const closeEditModal = () => {
        currentTask.current = undefined
        setIsTaskModalOpen(false)
    }


    return (
        <>
            <Button size='sm' variant='outline' onClick={() => openEditModal(-1)}>Create Task</Button>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="p-4">
                    {members.map(member => (
                        <div key={member.id} className="mb-6">
                            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                                <img
                                    src={member.avatar_url}
                                    alt={member.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                {member.name}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                {statuses.map(status => {
                                    const droppableId = `${member.id}--${status.id}`;
                                    const currentCellItems = items.filter(
                                        item => item.assignee_id === member.id && item.status_id === status.id
                                    );

                                    return (
                                        <Droppable key={droppableId} droppableId={droppableId}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`bg-white rounded-lg shadow-md p-3 ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                                                        }`}
                                                >
                                                    <h4 className="text-lg font-semibold text-gray-700">
                                                        {status.name} ({currentCellItems.length})
                                                    </h4>
                                                    <div className="space-y-2 mt-2">
                                                        {currentCellItems.map((item, index) => (
                                                            <Draggable
                                                                key={item.id}
                                                                draggableId={item.id.toString()}
                                                                index={index}
                                                            >
                                                                {(providedDraggable, snapshotDraggable) => (
                                                                    <div
                                                                        ref={providedDraggable.innerRef}
                                                                        {...providedDraggable.draggableProps}
                                                                        {...providedDraggable.dragHandleProps}
                                                                        className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm transition-all ${snapshotDraggable.isDragging
                                                                            ? 'bg-blue-100'
                                                                            : 'hover:bg-blue-50'
                                                                            }`}
                                                                    >
                                                                        <div className="flex justify-between items-start gap-2">
                                                                            <div className="flex-1">
                                                                                <div className="text-sm font-medium text-gray-800">{item.title}</div>
                                                                                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                                                            </div>
                                                                            <div className="flex flex-col items-end gap-1">
                                                                                <div className="flex gap-1">
                                                                                    <button
                                                                                        onClick={() => handleEditTask(item)}
                                                                                        className="p-1 hover:bg-gray-200 rounded"
                                                                                        title="Edit"
                                                                                    >
                                                                                        <Pen className="w-4 h-4 text-gray-600" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleViewTask(item)}
                                                                                        className="p-1 hover:bg-gray-200 rounded"
                                                                                        title="View"
                                                                                    >
                                                                                        <Eye className="w-4 h-4 text-gray-600" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteTask(item.id)}
                                                                                        className="p-1 hover:bg-red-100 rounded"
                                                                                        title="Delete"
                                                                                    >
                                                                                        <Trash className="w-4 h-4 text-red-600" />
                                                                                    </button>
                                                                                </div>
                                                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getPriorityColor(getPriority(item.priority_id)?.name || '')}`}>
                                                                                    {getPriority(item.priority_id)?.name}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {item.description}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                        {currentCellItems.length === 0 && !snapshot.isDraggingOver && (
                                                            <div className="text-center text-sm text-gray-400 italic mt-4">
                                                                No tasks here.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Droppable>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <TaskDetailModal isOpen={IsTaskModalOpen} onClose={closeEditModal} onSave={() => { }} taskToEdit={selectedTask ? selectedTask : undefined} />
            <ViewTaskModal
                task={selectedTask}
                isOpen={isViewModalOpen}
                onClose={() => setViewModalOpen(false)}
            />

        </>
    );
};

export default TeamKanbanBoard;
