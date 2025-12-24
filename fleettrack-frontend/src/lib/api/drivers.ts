import { apiClient } from './client';
import { DriverDto, CreateDriverRequest } from '@/types/driver';
import { PaginatedResponse } from './vehicles';

export const driversApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<DriverDto>> => {
    const response = await apiClient.get<PaginatedResponse<DriverDto>>('/drivers', {
      params: { pageNumber: page, pageSize },
    });
    return response.data;
  },

  getById: async (id: string): Promise<DriverDto> => {
    const response = await apiClient.get<DriverDto>(`/drivers/${id}`);
    return response.data;
  },

  create: async (data: CreateDriverRequest): Promise<DriverDto> => {
    const response = await apiClient.post<DriverDto>('/drivers', data);
    return response.data;
  },

  update: async (id: string, data: CreateDriverRequest): Promise<DriverDto> => {
    const response = await apiClient.put<DriverDto>(`/drivers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/drivers/${id}`);
  },
};
