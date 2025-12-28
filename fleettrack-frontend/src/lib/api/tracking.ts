import { apiClient } from './client';
import { ActiveTrackingSessionDto, TrackingSessionDto, TrackingSessionStartedDto, StartTrackingSessionDto } from '@/types/gps';
import { ApiResponse } from './types';

export const trackingApi = {
  // Get all active tracking sessions
  getActiveSessions: async (): Promise<ActiveTrackingSessionDto[]> => {
    const response = await apiClient.get<ActiveTrackingSessionDto[]>('/trackingsessions/active');
    return response.data;
  },

  // Get a session by ID
  getById: async (id: string): Promise<TrackingSessionDto> => {
    const response = await apiClient.get<TrackingSessionDto>(`/trackingsessions/${id}`);
    return response.data;
  },

  // Get active session for a vehicle
  getActiveByVehicle: async (vehicleId: string): Promise<TrackingSessionDto | null> => {
    try {
      const response = await apiClient.get<TrackingSessionDto>(`/trackingsessions/vehicle/${vehicleId}/active`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Get session history for a vehicle
  getVehicleHistory: async (vehicleId: string, limit = 10): Promise<TrackingSessionDto[]> => {
    const response = await apiClient.get<TrackingSessionDto[]>(`/trackingsessions/vehicle/${vehicleId}/history`, {
      params: { limit },
    });
    return response.data;
  },

  // Start a tracking session
  startSession: async (dto: StartTrackingSessionDto): Promise<TrackingSessionStartedDto> => {
    const response = await apiClient.post<TrackingSessionStartedDto>('/trackingsessions/start', dto);
    return response.data;
  },

  // Stop a tracking session
  stopSession: async (sessionId: string): Promise<void> => {
    await apiClient.post(`/trackingsessions/${sessionId}/stop`);
  },

  // Stop all sessions for a vehicle
  stopVehicleSessions: async (vehicleId: string): Promise<void> => {
    await apiClient.post(`/trackingsessions/vehicle/${vehicleId}/stop`);
  },
};
