export enum DriverStatus {
  Available = 0,
  OnDuty = 1,
  OnBreak = 2,
  OffDuty = 3,
  OnLeave = 4,
  Inactive = 5
}

export interface DriverDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  status: DriverStatus;
  currentVehicleId?: string;
  currentVehicleRegistration?: string;
}

export interface CreateDriverRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
}

export interface UpdateDriverRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseExpiryDate: string;
  status: DriverStatus;
}
