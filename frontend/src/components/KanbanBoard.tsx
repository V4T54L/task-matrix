import React, { useState } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from '@hello-pangea/dnd';

// --- Types ---
interface Item {
    id: string;
    content: string;
    assigneeId: string; // e.g., 'alice', 'bob'
    statusId: string;   // e.g., 'todo', 'inprogress', 'done'
}

interface Member {
    id: string;
    name: string;
}

interface StatusDef {
    id: string;
    title: string;
}

// --- Initial Data ---
const initialMembers: Member[] = [
    { id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' },
    { id: 'charlie', name: 'Charlie (No tasks initially)' }
];

const initialStatuses: StatusDef[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
];

const initialItems: Item[] = [
    { id: 'item-1', content: 'Alice Task 1 (Todo)', assigneeId: 'alice', statusId: 'todo' },
    { id: 'item-2', content: 'Alice Task 2 (Todo)', assigneeId: 'alice', statusId: 'todo' },
    { id: 'item-3', content: 'Alice Task 3 (In Progress)', assigneeId: 'alice', statusId: 'inprogress' },
    { id: 'item-4', content: 'Bob Task 1 (Todo)', assigneeId: 'bob', statusId: 'todo' },
    { id: 'item-5', content: 'Bob Task 2 (Done)', assigneeId: 'bob', statusId: 'done' },
    { id: 'item-6', content: 'Alice Task 4 (Done)', assigneeId: 'alice', statusId: 'done' },
    { id: 'item-7', content: 'Bob Task 3 (In Progress)', assigneeId: 'bob', statusId: 'inprogress' },
];


// --- Styling (Simplified) ---
const grid = 8;
const getItemStyle = (isDragging: boolean, draggableStyle?: React.CSSProperties): React.CSSProperties => ({
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    background: isDragging ? 'lightgreen' : 'grey',
    border: '1px solid #ccc',
    borderRadius: '4px',
    color: 'white',
    ...draggableStyle
});

const getListStyle = (isDraggingOver: boolean): React.CSSProperties => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    padding: grid,
    width: 250,
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column',
});

const getColumnHeaderStyle = (): React.CSSProperties => ({
    paddingBottom: grid,
    fontWeight: 'bold',
});

const getMemberRowStyle = (): React.CSSProperties => ({
    marginBottom: '20px',
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
});

const getBoardContainerStyle = (): React.CSSProperties => ({
    display: 'flex',
    gap: '16px', // Gap between columns
});


// --- Component ---
const TeamKanbanBoard: React.FC = () => {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [members] = useState<Member[]>(initialMembers);
    const [statuses] = useState<StatusDef[]>(initialStatuses);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Dropped outside the list
        if (!destination) {
            return;
        }

        const itemToMove = items.find(i => i.id === draggableId);
        if (!itemToMove) {
            console.error("Could not find item to move:", draggableId);
            return;
        }

        // Extract IDs from droppableId (format: "assigneeId--statusId")
        // const [sourceAssigneeId, sourceStatusId] = source.droppableId.split('--');
        const [destAssigneeId, destStatusId] = destination.droppableId.split('--');

        let newItems = Array.from(items);

        if (source.droppableId === destination.droppableId) {
            // Reordering within the same cell (same assignee, same status)
            const cellItems = newItems.filter(
                item => item.assigneeId === destAssigneeId && item.statusId === destStatusId
            );
            const [reorderedItem] = cellItems.splice(source.index, 1);
            cellItems.splice(destination.index, 0, reorderedItem);

            // Get items NOT in that cell
            const otherItems = newItems.filter(
                item => !(item.assigneeId === destAssigneeId && item.statusId === destStatusId)
            );

            // Reconstruct: items not in this cell, followed by items in this cell (now reordered)
            newItems = [...otherItems, ...cellItems];

        } else {
            // Moving to a different cell (different assignee or status or both)
            const updatedMovedItem = {
                ...itemToMove,
                assigneeId: destAssigneeId,
                statusId: destStatusId,
            };

            // 1. Remove the item from its original position in the main list
            newItems = newItems.filter(item => item.id !== draggableId);

            // 2. Get items currently in the destination cell (from the list where the dragged item was removed)
            const itemsInDestCell = newItems.filter(
                item => item.assigneeId === destAssigneeId && item.statusId === destStatusId
            );
            // 3. Insert the *updated* item at the drop location within this sub-list of destination cell items
            itemsInDestCell.splice(destination.index, 0, updatedMovedItem);

            // 4. Get items not in the destination cell (from the list where the dragged item was removed)
            const itemsNotInDestCell = newItems.filter(
                item => !(item.assigneeId === destAssigneeId && item.statusId === destStatusId)
            );

            // 5. Reconstruct: items not in destination cell, followed by all items from destination cell (now including the moved one, in order)
            newItems = [...itemsNotInDestCell, ...itemsInDestCell];
        }
        setItems(newItems);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ padding: '20px' }}>
                {members.map(member => (
                    <div key={member.id} style={getMemberRowStyle()}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            Member: {member.name}
                        </h3>
                        <div style={getBoardContainerStyle()}>
                            {statuses.map(status => {
                                const droppableId = `${member.id}--${status.id}`;
                                // Filter items for the current member and status
                                const currentCellItems = items.filter(
                                    item => item.assigneeId === member.id && item.statusId === status.id
                                );

                                return (
                                    <Droppable key={droppableId} droppableId={droppableId}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={getListStyle(snapshot.isDraggingOver)}
                                            >
                                                <h4 style={getColumnHeaderStyle()}>{status.title} ({currentCellItems.length})</h4>
                                                <div style={{ flexGrow: 1, overflowY: 'auto' /* For scroll if many items */ }}>
                                                    {currentCellItems.map((item, index) => (
                                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                                            {(providedDraggable, snapshotDraggable) => (
                                                                <div
                                                                    ref={providedDraggable.innerRef}
                                                                    {...providedDraggable.draggableProps}
                                                                    {...providedDraggable.dragHandleProps}
                                                                    style={getItemStyle(
                                                                        snapshotDraggable.isDragging,
                                                                        providedDraggable.draggableProps.style
                                                                    )}
                                                                >
                                                                    {item.content}
                                                                    <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '4px' }}>
                                                                        ID: {item.id}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                    {currentCellItems.length === 0 && !snapshot.isDraggingOver && (
                                                        <div style={{ textAlign: 'center', color: '#777', marginTop: '20px', fontStyle: 'italic' }}>
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