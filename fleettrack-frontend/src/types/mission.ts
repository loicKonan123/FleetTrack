export enum MissionStatus {
  Planned = 0,
  Assigned = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}

export enum MissionPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3
}

export interface MissionDto {
  id: string;
  name: string;
  description: string;
  status: MissionStatus;
  priority: MissionPriority;
  startDate: string;
  endDate?: string;
  estimatedDistance: number;
  actualDistance?: number;
  vehicleId: string;
  vehicleRegistration: string;
  driverId: string;
  driverName: string;
}

export interface CreateMissionRequest {
  name: string;
  description: string;
  priority: MissionPriority;
  startDate: string;
  endDate?: string;
  estimatedDistance: number;
  vehicleId: string;
  driverId: string;
}

export interface UpdateMissionRequest {
  name: string;
  description: string;
  priority: MissionPriority;
  status?: MissionStatus;
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
  estimatedDistance?: number;
  actualDistance?: number;
}

export interface UpdateMissionStatusRequest {
  status: MissionStatus;
}
