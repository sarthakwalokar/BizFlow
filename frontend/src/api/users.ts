import apiClient from './axios';
import { ApiResponse } from './health';
import { User } from './auth';

export interface UserProfileUpdateRequest {
  fullName: string;
  phone?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = {
  getMyProfile: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data.data;
  },

  updateMyProfile: async (data: UserProfileUpdateRequest): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>('/users/me', data);
    return res.data.data;
  },

  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    await apiClient.put<ApiResponse<void>>('/users/me/password', data);
  },
};
