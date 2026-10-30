import React, { useState, useRef, useEffect } from 'react';
import { Image, X, Save } from 'lucide-react';
import { postsApi } from '../../api/posts';
import type { Post } from '../../types/post';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { getErrorMessage } from '../../utils/helpers';

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updatedPost: Post) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [body, setBody] = useState(post?.body || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post?.image || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      setBody(post.body || '');
      setImagePreview(post.image || null);
      setImageFile(null);
      setError(null);
    }
  }, [post]);

  if (!post) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const postId = post._id || post.id || '';
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = (await postsApi.updatePost(postId, body.trim(), imageFile)) as any;
      const serverUpdatedPost = res?.data?.post || res?.post || res?.data;

      if (serverUpdatedPost && typeof serverUpdatedPost === 'object' && onUpdated) {
        onUpdated(serverUpdatedPost);
      } else if (onUpdated) {
        // Fallback optimistic update
        onUpdated({
          ...post,
          body: body.trim(),
          image: imagePreview || post.image,
        });
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:border-blue-400 focus:bg-white resize-none transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-56">
            <img
              src={imagePreview}
              alt="Post preview"
              className="w-full max-h-56 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1877F2] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
            >
              <Image size={16} />
              <span>Change Image</span>
            </button>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!body.trim() && !imagePreview}
            >
              <Save size={15} />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </form>
    </Modal>
  );
};
