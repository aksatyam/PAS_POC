export type UserRole = 'Admin' | 'Operations' | 'Underwriter' | 'Claims' | 'Viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hashedPassword: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
