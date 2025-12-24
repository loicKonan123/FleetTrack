export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
