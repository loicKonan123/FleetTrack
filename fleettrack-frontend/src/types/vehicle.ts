export enum VehicleType {
  Car = 0,
  Truck = 1,
  Van = 2,
  Motorcycle = 3,
  Bus = 4,
  Trailer = 5,
  Other = 6
}

export enum VehicleStatus {
  Available = 0,
  InUse = 1,
  Maintenance = 2,
  OutOfService = 3
}

export interface VehicleDto {
  id: string;
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  fuelType: string;
  fuelCapacity: number;
  currentMileage: number;
  lastMaintenanceDate?: string;
  lastMaintenanceMileage?: number;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleRequest {
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  fuelType: string;
  fuelCapacity: number;
  currentMileage: number;
}

export interface UpdateVehicleRequest {
  brand: string;
  model: string;
  status: VehicleStatus;
  currentFuelLevel: number;
  mileage: number;
  nextMaintenanceDate?: string;
}
