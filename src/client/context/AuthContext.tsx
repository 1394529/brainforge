import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserProgressData } from '../../types';

interface AuthContextType {
  user: UserProfile | null;
  progress: UserProgressData | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (displayName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  googleAuth: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ message: string; resetToken: string }>;
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<{ message: string }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateProfileSettings: (params: { displayName?: string; timezone?: string; showInLeaderboard?: boolean }) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgressData | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bf_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProgress(data.progress);
      } else {
        // Token expired or invalid
        localStorage.removeItem('bf_token');
        setToken(null);
        setUser(null);
        setProgress(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('bf_token', data.token);
      setUser(data.user);

      // Fetch progress
      const progressRes = await fetch('/api/progress', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (progressRes.ok) {
        const pData = await progressRes.json();
        setProgress(pData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    displayName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password, confirmPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Signup failed');
      }
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('bf_token', data.token);
      setUser(data.user);

      // Fetch progress
      const progressRes = await fetch('/api/progress', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (progressRes.ok) {
        const pData = await progressRes.json();
        setProgress(pData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'google.player@brainforge.io', name: 'Google Player' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Google sign in failed');
      }
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('bf_token', data.token);
      setUser(data.user);

      const progressRes = await fetch('/api/progress', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (progressRes.ok) {
        const pData = await progressRes.json();
        setProgress(pData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Password reset request failed');
    }
    return await res.json();
  };

  const resetPassword = async (resetToken: string, newPassword: string, confirmPassword: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword, confirmPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Password reset failed');
    }
    return await res.json();
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update password');
    }
    return await res.json();
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem('bf_token');
    setToken(null);
    setUser(null);
    setProgress(null);
  };

  const updateDisplayName = async (displayName: string) => {
    if (!token) return;
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ displayName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    const data = await res.json();
    setUser(data.user);
  };

  const updateProfileSettings = async (params: {
    displayName?: string;
    timezone?: string;
    showInLeaderboard?: boolean;
  }) => {
    if (!token) return;
    const res = await fetch('/api/profile/privacy', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update preferences');
    }
    const updatedUser = await res.json();
    setUser(updatedUser);
  };

  const refreshProgress = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/progress', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const pData = await res.json();
        setProgress(pData);
      }
    } catch (err) {
      console.error('Failed to refresh progress:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        progress,
        token,
        isLoading,
        login,
        signup,
        googleAuth,
        requestPasswordReset,
        resetPassword,
        changePassword,
        logout,
        updateDisplayName,
        updateProfileSettings,
        refreshProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
