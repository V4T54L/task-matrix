import api from './index';
import type {
    Project,
    ProjectDetail,
    ProjectPayload,
    User,
} from '../types';

export const createProject = async (payload: ProjectPayload): Promise<Project> => {
    const res = await api.post<Project>('/projects', payload);
    return res.data;
};

export const getProjects = async (): Promise<Project[]> => {
    const res = await api.get<Project[]>('/projects');
    return res.data;
};

export const getProjectDetail = async (id: number): Promise<ProjectDetail> => {
    const res = await api.get<ProjectDetail>(`/projects/${id}`);
    return res.data;
};

export const updateProject = async (id: number, payload: ProjectPayload): Promise<Project> => {
    const res = await api.put<Project>(`/projects/${id}`, payload);
    return res.data;
};

export const deleteProject = async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
};

export const addProjectMember = async (projectId: number, username: string): Promise<User> => {
    const res = await api.post<User>(`/projects/${projectId}/members/${username}`);
    return res.data;
};

export const removeProjectMember = async (projectId: number, userID: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${userID}`);
};
