import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { Post } from '../../types/post';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { getErrorMessage } from '../../utils/helpers';

interface SharePostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onShared?: (sharedPost: Post) => void;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({
  post,
  isOpen,
  onClose,
  onShared,
}) => {
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!post) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const postId = post._id || post.id || '';
    if (!postId) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await postsApi.sharePost(postId, body.trim() || 'Shared this post');
      setBody('');
      onClose();
      if (res?.data?.post && onShared) {
        onShared(res.data.post);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Post">
      <form onSubmit={handleShare} className="space-y-4">
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Say something about this post..."
            rows={3}
            className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white resize-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Embedded Post Preview */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
          <div className="flex items-center gap-2">
            <Avatar user={post.user} size="xs" />
            <div>
              <p className="text-xs font-bold text-slate-800">{post.user?.name}</p>
              <p className="text-[10px] text-slate-400">@{post.user?.username}</p>
            </div>
          </div>
          <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
            {post.body}
          </p>
          {post.image && (
            <img
              src={post.image}
              alt="Post media"
              className="w-full max-h-40 object-cover rounded-lg mt-2"
            />
          )}
        </div>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="!px-5"
          >
            <Send size={14} />
            <span>Share Now</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

