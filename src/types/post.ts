import { User } from './auth';

export interface Post {
  _id: string;
  id?: string;
  body: string;
  image?: string;
  user: User;
  createdAt: string;
  updatedAt?: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  likes?: string[] | User[];
  isLiked?: boolean;
  bookmarked?: boolean;
  sharedPost?: Post;
  comments?: any[];
}

export interface PostListResponse {
  success: boolean;
  message?: string;
  data: {
    posts: Post[];
    total?: number;
    page?: number;
    limit?: number;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface SinglePostResponse {
  success: boolean;
  message?: string;
  data: {
    post: Post;
  };
}

export interface PostLikesResponse {
  success: boolean;
  message?: string;
  data: {
    users: User[];
  };
}

export type FeedFilter = 'all' | 'following' | 'me';

