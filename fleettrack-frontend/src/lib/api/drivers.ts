import { apiClient } from './client';
import { DriverDto, CreateDriverRequest, UpdateDriverRequest } from '@/types/driver';
import { PaginatedResponse, ApiResponse } from './types';

export const driversApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<DriverDto>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<DriverDto>>>('/drivers', {
      params: { pageNumber: page, pageSize },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<DriverDto> => {
    const response = await apiClient.get<ApiResponse<DriverDto>>(`/drivers/${id}`);
    return response.data.data;
  },

  create: async (data: CreateDriverRequest): Promise<DriverDto> => {
    const response = await apiClient.post<ApiResponse<DriverDto>>('/drivers', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateDriverRequest): Promise<DriverDto> => {
    const response = await apiClient.put<ApiResponse<DriverDto>>(`/drivers/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/drivers/${id}`);
  },
};
