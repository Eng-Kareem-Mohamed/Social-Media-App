import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import type { LoginPayload, RegisterPayload, User } from '../types/auth';
import { isUserFollowedByCurrentUser } from '../utils/helpers';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  uploadPhoto: (file: File) => Promise<string | undefined>;
  toggleFollow: (targetUserId: string) => Promise<boolean>;
  isFollowing: (targetUserOrId?: User | string | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('token');
    return stored && stored !== 'undefined' && stored !== 'null' ? stored : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});

  // Initialize and verify user profile
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timeout')), 4000)
          );
          const profilePromise = authApi.getMyProfile();
          const res = (await Promise.race([profilePromise, timeoutPromise])) as any;

          const fetchedUser = res?.data?.user || res?.user || res?.data;
          if (mounted && fetchedUser && typeof fetchedUser === 'object') {
            setUser(fetchedUser);
            localStorage.setItem('user', JSON.stringify(fetchedUser));
          }
        } catch {
          if (mounted) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } else {
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await authApi.signin(payload);
    const authToken = res.data?.token;
    const authUser = res.data?.user;

    if (authToken) {
      localStorage.setItem('token', authToken);
      setToken(authToken);
    }
    if (authUser) {
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    }
    setFollowOverrides({});
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authApi.signup(payload);
    const authToken = res.data?.token;
    const authUser = res.data?.user;

    if (authToken) {
      localStorage.setItem('token', authToken);
      setToken(authToken);
    }
    if (authUser) {
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    }
    setFollowOverrides({});
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setFollowOverrides({});
  };

  const refreshProfile = async () => {
    try {
      const res = (await authApi.getMyProfile()) as any;
      const fetchedUser = res?.data?.user || res?.user || res?.data;
      if (fetchedUser && typeof fetchedUser === 'object') {
        setUser(fetchedUser);
        localStorage.setItem('user', JSON.stringify(fetchedUser));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const uploadPhoto = async (file: File) => {
    const res = (await authApi.uploadPhoto(file)) as any;
    // Extract new photo URL from any shape of response
    const newPhotoUrl =
      res?.data?.photo ||
      res?.data?.user?.photo ||
      res?.user?.photo ||
      res?.photo ||
      res?.data?.url;

    if (newPhotoUrl) {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, photo: newPhotoUrl };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    }

    await refreshProfile();
    return newPhotoUrl;
  };

  const isFollowing = (targetUserOrId?: User | string | null): boolean => {
    if (!targetUserOrId) return false;
    const targetId =
      typeof targetUserOrId === 'string'
        ? targetUserOrId
        : targetUserOrId._id || targetUserOrId.id;

    if (!targetId) return false;

    if (followOverrides[targetId] !== undefined) {
      return followOverrides[targetId];
    }

    return isUserFollowedByCurrentUser(targetUserOrId, user);
  };

  const toggleFollow = async (targetUserId: string): Promise<boolean> => {
    if (!targetUserId) return false;

    const currentStatus = isFollowing(targetUserId);
    const nextStatus = !currentStatus;

    // Optimistic update of local overrides
    setFollowOverrides((prev) => ({ ...prev, [targetUserId]: nextStatus }));

    // Optimistic update of user.following and user.followingCount
    setUser((prev) => {
      if (!prev) return prev;
      const prevFollowing = Array.isArray(prev.following) ? [...prev.following] : [];
      let updatedFollowing: any[];

      if (nextStatus) {
        const alreadyHas = prevFollowing.some((item: any) =>
          (typeof item === 'string' ? item : item?._id || item?.id) === targetUserId
        );
        updatedFollowing = alreadyHas ? prevFollowing : [...prevFollowing, targetUserId];
      } else {
        updatedFollowing = prevFollowing.filter((item: any) =>
          (typeof item === 'string' ? item : item?._id || item?.id) !== targetUserId
        );
      }

      const currentCount =
        typeof prev.followingCount === 'number'
          ? prev.followingCount
          : prevFollowing.length;
      const updatedCount = nextStatus
        ? currentCount + 1
        : Math.max(0, currentCount - 1);

      const updatedUser: User = {
        ...prev,
        following: updatedFollowing,
        followingCount: updatedCount,
      };
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch {
        // ignore quota errors
      }
      return updatedUser;
    });

    try {
      const res = (await authApi.toggleFollow(targetUserId)) as any;
      if (res?.message) {
        const msg = String(res.message).toLowerCase();
        if (msg.includes('unfollow') || msg.includes('removed')) {
          setFollowOverrides((prev) => ({ ...prev, [targetUserId]: false }));
          return false;
        } else if (msg.includes('follow') || msg.includes('added')) {
          setFollowOverrides((prev) => ({ ...prev, [targetUserId]: true }));
          return true;
        }
      }
      return nextStatus;
    } catch (err) {
      // Rollback override on error
      setFollowOverrides((prev) => ({ ...prev, [targetUserId]: currentStatus }));
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        uploadPhoto,
        toggleFollow,
        isFollowing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
