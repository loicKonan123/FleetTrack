import { apiClient } from './client';
import { VehicleDto, CreateVehicleRequest, UpdateVehicleRequest } from '@/types/vehicle';
import { GpsPositionDto } from '@/types/gps';

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const vehiclesApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<VehicleDto>> => {
    const response = await apiClient.get<PaginatedResponse<VehicleDto>>('/vehicles', {
      params: { pageNumber: page, pageSize },
    });
    return response.data;
  },

  getById: async (id: string): Promise<VehicleDto> => {
    const response = await apiClient.get<VehicleDto>(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data: CreateVehicleRequest): Promise<VehicleDto> => {
    const response = await apiClient.post<VehicleDto>('/vehicles', data);
    return response.data;
  },

  update: async (id: string, data: UpdateVehicleRequest): Promise<VehicleDto> => {
    const response = await apiClient.put<VehicleDto>(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  },

  getPositions: async (id: string): Promise<GpsPositionDto[]> => {
    const response = await apiClient.get<GpsPositionDto[]>(`/vehicles/${id}/positions`);
    return response.data;
  },
};
