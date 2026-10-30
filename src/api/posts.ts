import apiClient from './client';
import type {
  FeedFilter,
  Post,
  PostLikesResponse,
  PostListResponse,
  SinglePostResponse,
} from '../types/post';

export const postsApi = {
  // Public post listing (default newest first)
  getAllPosts: async (page = 1, limit = 10): Promise<PostListResponse> => {
    const response = await apiClient.get<PostListResponse>(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Home timeline feed (following / me / all)
  getFeed: async (
    filter: FeedFilter = 'all',
    page = 1,
    limit = 10
  ): Promise<PostListResponse> => {
    const query = filter !== 'all' ? `&only=${filter}` : '';
    const response = await apiClient.get<PostListResponse>(
      `/posts/feed?page=${page}&limit=${limit}${query}`
    );
    return response.data;
  },

  // Get single post
  getPost: async (postId: string): Promise<SinglePostResponse> => {
    const response = await apiClient.get<SinglePostResponse>(`/posts/${postId}`);
    return response.data;
  },

  // Create post (let Axios auto-set multipart/form-data with boundary)
  createPost: async (body: string, imageFile?: File): Promise<{ success: boolean; data: { post: Post } }> => {
    const formData = new FormData();
    formData.append('body', body);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await apiClient.post('/posts', formData);
    return response.data;
  },

  // Update post (let Axios auto-set multipart/form-data with boundary)
  updatePost: async (
    postId: string,
    body: string,
    imageFile?: File | null
  ): Promise<{ success: boolean; data: { post: Post } }> => {
    const formData = new FormData();
    formData.append('body', body);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await apiClient.put(`/posts/${postId}`, formData);
    return response.data;
  },

  // Delete post
  deletePost: async (postId: string) => {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  },

  // Like / Unlike toggle with empty body
  toggleLike: async (postId: string) => {
    const response = await apiClient.put(`/posts/${postId}/like`, {});
    return response.data;
  },

  // List users who liked a post
  getPostLikes: async (postId: string, page = 1, limit = 20): Promise<PostLikesResponse> => {
    const response = await apiClient.get<PostLikesResponse>(
      `/posts/${postId}/likes?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Bookmark / Unbookmark toggle with empty body
  toggleBookmark: async (postId: string) => {
    const response = await apiClient.put(`/posts/${postId}/bookmark`, {});
    return response.data;
  },

  // Share post with quotation body
  sharePost: async (postId: string, body: string) => {
    const response = await apiClient.post(`/posts/${postId}/share`, { body });
    return response.data;
  },
};
