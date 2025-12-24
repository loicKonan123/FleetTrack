export interface DriverDto {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  phoneNumber: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateDriverRequest {
  userId: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  phoneNumber: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
}
