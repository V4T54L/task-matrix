import React, { useState } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from '@hello-pangea/dnd';
import type { Member, Status, Task, Priority } from '../types';
import { mockTaskStatus } from '../mock/status';
import { mockPriorities } from '../mock/priorities';

type TeamKanbanBoardProps = {
    tasks: Task[],
    members: Member[],
}

const TeamKanbanBoard: React.FC<TeamKanbanBoardProps> = ({ members, tasks }) => {
    const [items, setItems] = useState<Task[]>(tasks);
    const [statuses] = useState<Status[]>(mockTaskStatus);
    const [priorities] = useState<Priority[]>(mockPriorities);

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

    return (
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
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="text-sm font-medium text-gray-800">
                                                                            {item.title}
                                                                        </div>
                                                                        {(() => {
                                                                            const priority = getPriority(item.priority_id);
                                                                            return priority ? (
                                                                                <span
                                                                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                                                                                        priority.name
                                                                                    )}`}
                                                                                >
                                                                                    {priority.name}
                                                                                </span>
                                                                            ) : null;
                                                                        })()}
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
    );
};

export default TeamKanbanBoard;
