import { apiClient, setTokens, clearTokens } from './client';
import { LoginRequest, RegisterRequest, AuthResponse, UserDto, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth';
import { ApiResponse } from './types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const authData = response.data.data;
    setTokens(authData.accessToken, authData.refreshToken);
    return authData;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const authData = response.data.data;
    setTokens(authData.accessToken, authData.refreshToken);
    return authData;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    clearTokens();
  },

  getCurrentUser: async (): Promise<UserDto> => {
    const response = await apiClient.get<ApiResponse<UserDto>>('/auth/me');
    return response.data.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },
};
