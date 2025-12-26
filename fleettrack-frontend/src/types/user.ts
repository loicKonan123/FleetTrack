export interface UserListDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  lastLoginDate?: string;
  createdAt: string;
}

export interface UserDetailsDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginDate?: string;
  createdAt: string;
  updatedAt?: string;
  roleId: string;
  roleName: string;
  roleDescription: string;
  driverId?: string;
  driverLicenseNumber?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId: string;
  driverId?: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roleId?: string;
  driverId?: string;
  isActive?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description: string;
  userCount: number;
}
