import { apiClient } from './client';
import type {
  ApiResponse,
  PageResponse,
  User,
  UserCreateRequest,
  UserUpdateRequest,
  UserSearchParams,
} from '@/types/api';

const USERS_BASE = '/api/v1/admin/users';

export const usersApi = {
  // Get all users with pagination and filters
  getUsers: async (params: UserSearchParams = {}) => {
    const response = await apiClient.get<ApiResponse<PageResponse<User>>>(
      USERS_BASE,
      { params }
    );
    return response.data;
  },

  // Get user by ID
  getUser: async (userId: number) => {
    const response = await apiClient.get<ApiResponse<User>>(
      `${USERS_BASE}/${userId}`
    );
    return response.data;
  },

  // Create user
  createUser: async (data: UserCreateRequest) => {
    const response = await apiClient.post<ApiResponse<User>>(
      USERS_BASE,
      data
    );
    return response.data;
  },

  // Update user
  updateUser: async (userId: number, data: UserUpdateRequest) => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_BASE}/${userId}`,
      data
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${USERS_BASE}/${userId}`
    );
    return response.data;
  },

  // Change password
  changePassword: async (userId: number, newPassword: string) => {
    const response = await apiClient.patch<ApiResponse<void>>(
      `${USERS_BASE}/${userId}/password`,
      { newPassword }
    );
    return response.data;
  },

  // Lock account
  lockAccount: async (userId: number) => {
    const response = await apiClient.patch<ApiResponse<void>>(
      `${USERS_BASE}/${userId}/lock`
    );
    return response.data;
  },

  // Unlock account
  unlockAccount: async (userId: number) => {
    const response = await apiClient.patch<ApiResponse<void>>(
      `${USERS_BASE}/${userId}/unlock`
    );
    return response.data;
  },
};
