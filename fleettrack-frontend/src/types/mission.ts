import { VehicleDto } from './vehicle';
import { DriverDto } from './driver';

export enum MissionStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export enum MissionPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3
}

export interface MissionDto {
  id: string;
  vehicleId: string;
  driverId: string;
  status: MissionStatus;
  priority: MissionPriority;
  startLocation: string;
  endLocation: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  estimatedDistance: number;
  actualDistance?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: VehicleDto;
  driver?: DriverDto;
}

export interface CreateMissionRequest {
  vehicleId: string;
  driverId: string;
  priority: MissionPriority;
  startLocation: string;
  endLocation: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedDistance: number;
  notes?: string;
}

export interface UpdateMissionStatusRequest {
  status: MissionStatus;
}
