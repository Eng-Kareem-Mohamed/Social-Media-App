import React from 'react';

interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`floating-card ${glow ? 'ring-2 ring-blue-400/20 shadow-[0_24px_65px_-10px_rgba(24,119,242,0.18)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

