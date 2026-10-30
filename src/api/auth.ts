import apiClient from './client';
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  SuggestionsResponse,
  User,
} from '../types/auth';
import type { Post } from '../types/post';

export const authApi = {
  // Sign up
  signup: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/signup', payload);
    return response.data;
  },

  // Sign in
  signin: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/signin', payload);
    return response.data;
  },

  // Change Password
  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await apiClient.patch('/users/change-password', payload);
    return response.data;
  },

  // Upload Profile Photo (Cloudflare R2) - let Axios set multipart boundary
  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await apiClient.put('/users/upload-photo', formData);
    return response.data;
  },

  // Current authenticated user profile
  getMyProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await apiClient.get('/users/profile-data');
    return response.data;
  },

  // Follow suggestions
  getSuggestions: async (page = 1, limit = 10): Promise<SuggestionsResponse> => {
    const response = await apiClient.get(`/users/suggestions?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Other user's profile
  getUserProfile: async (userId: string): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await apiClient.get(`/users/${userId}/profile`);
    return response.data;
  },

  // Follow / Unfollow user toggle
  toggleFollow: async (userId: string) => {
    const response = await apiClient.put(`/users/${userId}/follow`, {});
    return response.data;
  },

  // User's specific posts
  getUserPosts: async (userId: string): Promise<{ success: boolean; data: { posts: Post[] } }> => {
    const response = await apiClient.get(`/users/${userId}/posts`);
    return response.data;
  },

  // Get current user's bookmarks
  getBookmarks: async (): Promise<{ success: boolean; data: { posts: Post[] } }> => {
    const response = await apiClient.get('/users/bookmarks');
    return response.data;
  },
};
