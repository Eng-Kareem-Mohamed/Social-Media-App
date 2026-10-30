import React, { useState, useRef } from 'react';
import { Image, X, Send, Sparkles, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { postsApi } from '../../api/posts';
import { Post } from '../../types/post';
import { FloatingCard } from '../common/FloatingCard';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { getErrorMessage } from '../../utils/helpers';

interface PostComposerProps {
  onPostCreated?: (post: Post) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image file is too large (max 8MB)');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() && !imageFile) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await postsApi.createPost(body.trim(), imageFile || undefined);
      setBody('');
      removeImage();
      if (res.data?.post && onPostCreated) {
        onPostCreated(res.data.post);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FloatingCard className="p-4 sm:p-5 mb-6 relative overflow-hidden">
      <div className="flex items-start gap-3">
        <Avatar user={user} size="md" showOrbitalRing={false} />

        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'student'}?`}
              rows={3}
              className="w-full text-xs sm:text-sm bg-transparent border-0 outline-none resize-none placeholder:text-slate-400 text-[#0F172A] focus:ring-0 leading-relaxed"
            />

            {/* Image Preview Thumbnail */}
            {imagePreview && (
              <div className="relative mt-2 mb-3 rounded-2xl overflow-hidden border border-white/80 shadow-md max-h-72 bg-slate-50 group">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full h-full max-h-72 object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-500 mb-2 font-medium">{error}</p>
            )}

            {/* Composer Footer & Toolbar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1877F2] hover:bg-blue-50/80 rounded-xl transition-colors cursor-pointer"
                >
                  <Image size={17} />
                  <span>Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBody((prev) => prev + ' 🚀')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer"
                >
                  <Smile size={17} />
                  <span className="hidden sm:inline">Feeling</span>
                </button>
              </div>

              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isLoading}
                disabled={!body.trim() && !imageFile}
                className="!px-4 !py-1.5 font-bold shadow-md"
              >
                <Send size={14} />
                <span>Post</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FloatingCard>
  );
};

