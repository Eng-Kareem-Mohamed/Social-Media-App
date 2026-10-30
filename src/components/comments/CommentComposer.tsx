import React, { useState, useRef } from 'react';
import { Send, Image, X } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

interface CommentComposerProps {
  onSubmit: (content: string, imageFile?: File) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md';
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
  onSubmit,
  placeholder = 'Write a thoughtful comment...',
  autoFocus = false,
  size = 'md',
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setIsLoading(true);
    try {
      await onSubmit(content.trim(), imageFile || undefined);
      setContent('');
      removeImage();
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2.5">
      <Avatar user={user} size={size === 'sm' ? 'xs' : 'sm'} />
      <div className="flex-1 bg-slate-100/80 hover:bg-slate-100/90 focus-within:bg-white border border-slate-200/60 focus-within:border-blue-400/80 rounded-2xl p-2 transition-all">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={1}
          className="w-full text-xs sm:text-sm bg-transparent border-0 outline-none resize-none placeholder:text-slate-400 text-slate-800 focus:ring-0 leading-relaxed px-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        {imagePreview && (
          <div className="relative mt-2 mb-1 inline-block rounded-xl overflow-hidden border border-slate-200 max-h-36">
            <img
              src={imagePreview}
              alt="Attachment"
              className="max-h-36 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1.5 right-1.5 p-1 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 mt-1">
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
              className="p-1 text-slate-400 hover:text-[#1877F2] transition-colors rounded-lg"
              title="Add Image"
            >
              <Image size={15} />
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !imageFile) || isLoading}
            className="p-1.5 text-white bg-[#1877F2] hover:bg-[#0D6EFD] disabled:opacity-40 disabled:hover:bg-[#1877F2] rounded-xl transition-all shadow-xs"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </form>
  );
};

