import { apiClient } from './client';
import { AlertDto, CreateAlertRequest, AcknowledgeAlertRequest, ResolveAlertRequest, AlertType, AlertSeverity } from '@/types/alert';
import { PaginatedResponse, ApiResponse } from './types';

export interface AlertFilters {
  vehicleId?: string;
  type?: AlertType;
  severity?: AlertSeverity;
  isAcknowledged?: boolean;
  isResolved?: boolean;
}

export const alertsApi = {
  getAll: async (page = 1, pageSize = 10, filters?: AlertFilters): Promise<PaginatedResponse<AlertDto>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AlertDto>>>('/alerts', {
      params: { pageNumber: page, pageSize, ...filters },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<AlertDto> => {
    const response = await apiClient.get<ApiResponse<AlertDto>>(`/alerts/${id}`);
    return response.data.data;
  },

  getByVehicle: async (vehicleId: string): Promise<AlertDto[]> => {
    const response = await apiClient.get<ApiResponse<AlertDto[]>>(`/alerts/vehicle/${vehicleId}`);
    return response.data.data;
  },

  getUnacknowledged: async (): Promise<AlertDto[]> => {
    const response = await apiClient.get<ApiResponse<AlertDto[]>>('/alerts/unacknowledged');
    return response.data.data;
  },

  getUnresolved: async (): Promise<AlertDto[]> => {
    const response = await apiClient.get<ApiResponse<AlertDto[]>>('/alerts/unresolved');
    return response.data.data;
  },

  getUnacknowledgedCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<number>>('/alerts/unacknowledged/count');
    return response.data.data;
  },

  create: async (data: CreateAlertRequest): Promise<AlertDto> => {
    const response = await apiClient.post<ApiResponse<AlertDto>>('/alerts', data);
    return response.data.data;
  },

  acknowledge: async (id: string, data: AcknowledgeAlertRequest): Promise<AlertDto> => {
    const response = await apiClient.post<ApiResponse<AlertDto>>(`/alerts/${id}/acknowledge`, data);
    return response.data.data;
  },

  resolve: async (id: string, data: ResolveAlertRequest): Promise<AlertDto> => {
    const response = await apiClient.post<ApiResponse<AlertDto>>(`/alerts/${id}/resolve`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/alerts/${id}`);
  },
};
