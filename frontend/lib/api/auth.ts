import api from './axios';
import type { LoginDto, LoginResponse, User } from '../types/auth';

export const authApi = {
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    const res = await api.post<{ data: LoginResponse }>('/auth/login', dto);
    return res.data.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get<{ data: User }>('/auth/me');
    return res.data.data;
  },
};
