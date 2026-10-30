import apiClient from './client';
import type { Comment, CommentsResponse, RepliesResponse, Reply } from '../types/comment';

export const commentsApi = {
  // Get comments of a post
  getComments: async (postId: string, page = 1, limit = 10): Promise<CommentsResponse> => {
    const response = await apiClient.get<CommentsResponse>(
      `/posts/${postId}/comments?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Create comment (text and/or image)
  createComment: async (
    postId: string,
    content: string,
    imageFile?: File
  ): Promise<{ success: boolean; data: { comment: Comment } }> => {
    const formData = new FormData();
    formData.append('content', content);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await apiClient.post(`/posts/${postId}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get comment replies
  getReplies: async (
    postId: string,
    commentId: string,
    page = 1,
    limit = 10
  ): Promise<RepliesResponse> => {
    const response = await apiClient.get<RepliesResponse>(
      `/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Create reply
  createReply: async (
    postId: string,
    commentId: string,
    content: string,
    imageFile?: File
  ): Promise<{ success: boolean; data: { reply: Reply } }> => {
    const formData = new FormData();
    formData.append('content', content);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await apiClient.post(
      `/posts/${postId}/comments/${commentId}/replies`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update comment
  updateComment: async (
    postId: string,
    commentId: string,
    content: string,
    imageFile?: File
  ) => {
    const formData = new FormData();
    formData.append('content', content);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await apiClient.put(
      `/posts/${postId}/comments/${commentId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Delete comment
  deleteComment: async (postId: string, commentId: string) => {
    const response = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  // Like / Unlike comment with empty payload and endpoint fallback
  toggleCommentLike: async (postId: string, commentId: string) => {
    try {
      const response = await apiClient.put(
        `/posts/${postId}/comments/${commentId}/like`,
        {}
      );
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Fallback if backend mounted on /comments/:id/like
        const fallback = await apiClient.put(`/comments/${commentId}/like`, {});
        return fallback.data;
      }
      throw err;
    }
  },
};
