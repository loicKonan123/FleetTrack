import { apiClient } from './client';
import { MaintenanceDto, CreateMaintenanceRequest, UpdateMaintenanceRequest, CompleteMaintenanceRequest, MaintenanceType } from '@/types/maintenance';
import { PaginatedResponse, ApiResponse } from './types';

export interface MaintenanceFilters {
  vehicleId?: string;
  type?: MaintenanceType;
  isCompleted?: boolean;
}

export const maintenanceApi = {
  getAll: async (page = 1, pageSize = 10, filters?: MaintenanceFilters): Promise<PaginatedResponse<MaintenanceDto>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<MaintenanceDto>>>('/maintenance', {
      params: { pageNumber: page, pageSize, ...filters },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<MaintenanceDto> => {
    const response = await apiClient.get<ApiResponse<MaintenanceDto>>(`/maintenance/${id}`);
    return response.data.data;
  },

  getByVehicle: async (vehicleId: string): Promise<MaintenanceDto[]> => {
    const response = await apiClient.get<ApiResponse<MaintenanceDto[]>>(`/maintenance/vehicle/${vehicleId}`);
    return response.data.data;
  },

  getUpcoming: async (days = 30): Promise<MaintenanceDto[]> => {
    const response = await apiClient.get<ApiResponse<MaintenanceDto[]>>('/maintenance/upcoming', {
      params: { days },
    });
    return response.data.data;
  },

  getOverdue: async (): Promise<MaintenanceDto[]> => {
    const response = await apiClient.get<ApiResponse<MaintenanceDto[]>>('/maintenance/overdue');
    return response.data.data;
  },

  create: async (data: CreateMaintenanceRequest): Promise<MaintenanceDto> => {
    const response = await apiClient.post<ApiResponse<MaintenanceDto>>('/maintenance', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateMaintenanceRequest): Promise<MaintenanceDto> => {
    const response = await apiClient.put<ApiResponse<MaintenanceDto>>(`/maintenance/${id}`, data);
    return response.data.data;
  },

  complete: async (id: string, data: CompleteMaintenanceRequest): Promise<MaintenanceDto> => {
    const response = await apiClient.post<ApiResponse<MaintenanceDto>>(`/maintenance/${id}/complete`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/maintenance/${id}`);
  },
};
