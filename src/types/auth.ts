export interface User {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  photo?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  createdAt?: string;
  followersCount?: number;
  followingCount?: number;
  followers?: string[] | User[];
  following?: string[] | User[];
  bookmarks?: string[];
  isFollowing?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  password: string;
  rePassword: string;
}

export interface LoginPayload {
  email: string; // or username or login
  password: string;
}

export interface ChangePasswordPayload {
  password: string;
  newPassword: string;
}

export interface SuggestionsResponse {
  success: boolean;
  message?: string;
  data: {
    users: User[];
  };
}

