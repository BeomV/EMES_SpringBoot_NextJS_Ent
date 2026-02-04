// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  success: boolean;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  timestamp: string;
  path: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    userId: number;
    username: string;
    email: string;
    displayName: string;
  };
}

// User Types
export interface User {
  userId: number;
  username: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  enabled: boolean;
  accountLocked: boolean;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  enabled?: boolean;
}

export interface UserUpdateRequest {
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  enabled?: boolean;
  accountLocked?: boolean;
}

export interface UserSearchParams {
  username?: string;
  email?: string;
  displayName?: string;
  department?: string;
  position?: string;
  enabled?: boolean;
  accountLocked?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
