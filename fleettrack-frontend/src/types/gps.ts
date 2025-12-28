export interface GpsPositionUpdateDto {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
  timestamp: string;
  // Vehicle info
  vehiclePlateNumber?: string;
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  // Driver info
  driverName?: string;
  driverPhone?: string;
}

export interface TrackingEventDto {
  vehicleId: string;
  eventType: string;
  message?: string;
  timestamp: string;
}

export interface GpsPositionDto {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
  createdAt: string;
}

// Session types (aligned with backend DTOs)
export interface StartTrackingSessionDto {
  vehicleId: string;
  driverName?: string;
  driverPhone?: string;
  missionId?: string;
}

export interface TrackingSessionStartedDto {
  sessionId: string;
  vehicleId: string;
  startedAt: string;
}

export interface ActiveTrackingSessionDto {
  sessionId: string;
  vehicleId: string;
  vehiclePlateNumber?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType?: string;
  driverName?: string;
  driverPhone?: string;
  startedAt: string;
  lastPositionAt?: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  positionsCount: number;
  isActive: boolean;
  missionId?: string;
  missionName?: string;
}

export interface TrackingSessionDto {
  id: string;
  vehicleId: string;
  vehiclePlateNumber?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  lastLatitude?: number;
  lastLongitude?: number;
  lastSpeed?: number;
  lastHeading?: number;
  lastPositionAt?: string;
  positionsCount: number;
  totalDistance: number;
  missionId?: string;
}
