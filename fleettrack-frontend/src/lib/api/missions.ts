import { apiClient } from './client';
import { MissionDto, CreateMissionRequest, UpdateMissionRequest, UpdateMissionStatusRequest } from '@/types/mission';
import { PaginatedResponse, ApiResponse } from './types';

export const missionsApi = {
  getAll: async (page = 1, pageSize = 10, filters?: Record<string, string>): Promise<PaginatedResponse<MissionDto>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<MissionDto>>>('/missions', {
      params: { pageNumber: page, pageSize, ...filters },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<MissionDto> => {
    const response = await apiClient.get<ApiResponse<MissionDto>>(`/missions/${id}`);
    return response.data.data;
  },

  create: async (data: CreateMissionRequest): Promise<MissionDto> => {
    const response = await apiClient.post<ApiResponse<MissionDto>>('/missions', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateMissionRequest): Promise<MissionDto> => {
    const response = await apiClient.put<ApiResponse<MissionDto>>(`/missions/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: UpdateMissionStatusRequest): Promise<MissionDto> => {
    const response = await apiClient.patch<ApiResponse<MissionDto>>(`/missions/${id}/status`, status);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/missions/${id}`);
  },
};
