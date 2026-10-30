import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#1877F2] hover:bg-[#0D6EFD] text-white shadow-[0_10px_25px_-5px_rgba(24,119,242,0.4)] hover:shadow-[0_12px_28px_-5px_rgba(24,119,242,0.5)] border border-blue-400/30',
    secondary:
      'bg-blue-50/80 hover:bg-blue-100/90 text-[#1877F2] border border-blue-100',
    outline:
      'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100/70 text-slate-600 hover:text-slate-900',
    danger:
      'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-sm',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

