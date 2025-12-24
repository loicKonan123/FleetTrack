export interface GpsPositionUpdateDto {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp: string;
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
