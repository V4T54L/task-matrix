import api from './index';
import type { LoginPayload, SignupPayload, AuthResponse, User } from '../types';

export const login = async (data: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
};

export const signup = async (data: SignupPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/signup', data);
    return res.data;
};

export const validate = async (): Promise<User> => {
    const res = await api.get<User>('/auth/validate');
    return res.data;
};
