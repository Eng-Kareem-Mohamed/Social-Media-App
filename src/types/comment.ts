import { User } from './auth';

export interface Comment {
  _id: string;
  id?: string;
  content: string;
  image?: string;
  post: string;
  commentCreator: User;
  createdAt: string;
  updatedAt?: string;
  likesCount?: number;
  likes?: string[] | User[];
  isLiked?: boolean;
  repliesCount?: number;
  replies?: Reply[];
}

export interface Reply {
  _id: string;
  id?: string;
  content: string;
  image?: string;
  comment: string;
  replyCreator: User;
  createdAt: string;
  updatedAt?: string;
  likesCount?: number;
  likes?: string[] | User[];
  isLiked?: boolean;
}

export interface CommentsResponse {
  success: boolean;
  message?: string;
  data: {
    comments: Comment[];
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface RepliesResponse {
  success: boolean;
  message?: string;
  data: {
    replies: Reply[];
    total?: number;
    page?: number;
    limit?: number;
  };
}

