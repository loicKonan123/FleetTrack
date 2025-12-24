import { apiClient, setTokens, clearTokens } from './client';
import { LoginRequest, RegisterRequest, AuthResponse, UserDto } from '@/types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    clearTokens();
  },

  getCurrentUser: async (): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>('/auth/me');
    return response.data;
  },
};
