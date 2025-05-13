import api from './index';
import type { Task, TaskPayload, MessageResponse } from '../types';

export const createTask = async (
    projectId: number,
    payload: TaskPayload
): Promise<Task> => {
    const res = await api.post<Task>(`/projects/${projectId}/tasks`, payload);
    return res.data;
};

export const updateTask = async (
    projectId: number,
    taskId: number,
    payload: TaskPayload
): Promise<MessageResponse> => {
    const res = await api.put<MessageResponse>(`/projects/${projectId}/tasks/${taskId}`, payload);
    return res.data;
};

export const deleteTask = async (
    projectId: number,
    taskId: number
): Promise<void> => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
};
