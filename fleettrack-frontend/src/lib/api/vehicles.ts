import { apiClient } from './client';
import { VehicleDto, CreateVehicleRequest, UpdateVehicleRequest } from '@/types/vehicle';
import { GpsPositionDto } from '@/types/gps';
import { PaginatedResponse, ApiResponse } from './types';

export const vehiclesApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<VehicleDto>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<VehicleDto>>>('/vehicles', {
      params: { pageNumber: page, pageSize },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<VehicleDto> => {
    const response = await apiClient.get<ApiResponse<VehicleDto>>(`/vehicles/${id}`);
    return response.data.data;
  },

  create: async (data: CreateVehicleRequest): Promise<VehicleDto> => {
    const response = await apiClient.post<ApiResponse<VehicleDto>>('/vehicles', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateVehicleRequest): Promise<VehicleDto> => {
    const response = await apiClient.put<ApiResponse<VehicleDto>>(`/vehicles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  },

  getPositions: async (id: string): Promise<GpsPositionDto[]> => {
    const response = await apiClient.get<GpsPositionDto[]>(`/vehicles/${id}/positions`);
    return response.data;
  },
};
