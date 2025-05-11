import type { Status } from "../types";

export const mockProjectStatus: Status[] = [
    { id: 1, name: "Initialized" },
    { id: 2, name: "In Progress" },
    { id: 3, name: "Completed" },
    { id: 4, name: "On Hold" },
    { id: 5, name: "Cancelled" },
]

export const mockTaskStatus: Status[] = [
    { id: 1, name: "Todo" },
    { id: 2, name: "Progress" },
    { id: 3, name: "Review" },
    { id: 4, name: "Completed" },
]