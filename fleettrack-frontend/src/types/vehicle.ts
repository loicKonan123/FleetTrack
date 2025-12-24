export enum VehicleType {
  Truck = 0,
  Van = 1,
  Car = 2,
  Motorcycle = 3,
  Bus = 4
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

export interface UpdateVehicleRequest extends CreateVehicleRequest {
  status: VehicleStatus;
  lastMaintenanceDate?: string;
  lastMaintenanceMileage?: number;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
}
