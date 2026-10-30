import React, { useState, useEffect } from 'react';
import type { User } from '../../types/auth';
import { getAvatarUrl, getInitials } from '../../utils/helpers';

interface AvatarProps {
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOrbitalRing?: boolean;
  showOrbitingBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-24 h-24 text-xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  showOrbitalRing = false,
  showOrbitingBadge = false,
  className = '',
  onClick,
}) => {
  const photoUrl = getAvatarUrl(user);
  const initials = getInitials(user?.name || user?.username);
  const [hasError, setHasError] = useState(false);

  // Reset error state whenever the user or photoUrl changes
  useEffect(() => {
    setHasError(false);
  }, [photoUrl]);

  const showImage = !!photoUrl && !hasError;

  const avatarContent = (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full font-semibold overflow-hidden transition-transform duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${sizeMap[size]} ${className}`}
    >
      {showImage ? (
        <img
          key={photoUrl}
          src={photoUrl}
          alt={user?.name || 'User'}
          className="w-full h-full object-cover rounded-full"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-[#1877F2] to-[#0D6EFD] text-white shadow-inner select-none">
          {initials}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative inline-flex items-center justify-center">
      {showOrbitalRing ? (
        <div className="orbital-ring">
          {avatarContent}
        </div>
      ) : (
        avatarContent
      )}

      {showOrbitingBadge && (
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-blue-700 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-blue-200 flex items-center gap-1 select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Orbiting
        </span>
      )}
    </div>
  );
};
