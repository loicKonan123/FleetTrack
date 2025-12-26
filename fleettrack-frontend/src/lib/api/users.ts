import { apiClient } from './client';
import { UserListDto, UserDetailsDto, CreateUserRequest, UpdateUserRequest, ResetPasswordRequest, RoleDto } from '@/types/user';
import { PaginatedResponse, ApiResponse } from './types';

export const usersApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<UserListDto>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<UserListDto>>>('/users', {
      params: { pageNumber: page, pageSize },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<UserDetailsDto> => {
    const response = await apiClient.get<ApiResponse<UserDetailsDto>>(`/users/${id}`);
    return response.data.data;
  },

  getByRole: async (roleId: string): Promise<UserListDto[]> => {
    const response = await apiClient.get<ApiResponse<UserListDto[]>>(`/users/role/${roleId}`);
    return response.data.data;
  },

  create: async (data: CreateUserRequest): Promise<UserDetailsDto> => {
    const response = await apiClient.post<ApiResponse<UserDetailsDto>>('/users', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<UserDetailsDto> => {
    const response = await apiClient.put<ApiResponse<UserDetailsDto>>(`/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  resetPassword: async (id: string, data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(`/users/${id}/reset-password`, data);
  },

  activate: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/activate`);
  },

  deactivate: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/deactivate`);
  },

  getRoles: async (): Promise<RoleDto[]> => {
    const response = await apiClient.get<ApiResponse<RoleDto[]>>('/users/roles');
    return response.data.data;
  },
};
