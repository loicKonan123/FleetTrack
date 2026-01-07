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

export enum FuelType {
  Gasoline = 0,
  Diesel = 1,
  Electric = 2,
  Hybrid = 3,
  LPG = 4,
  CNG = 5,
  Hydrogen = 6
}

export interface VehicleDto {
  id: string;
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  fuelType: FuelType;
  fuelCapacity: number;
  currentFuelLevel: number;
  mileage: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  currentDriverId?: string;
  currentDriverName?: string;
}

export interface CreateVehicleRequest {
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  fuelType: FuelType;
  fuelCapacity: number;
  currentFuelLevel: number;
  mileage: number;
}

export interface UpdateVehicleRequest {
  brand: string;
  model: string;
  status: VehicleStatus;
  currentFuelLevel: number;
  mileage: number;
  nextMaintenanceDate?: string;
}
