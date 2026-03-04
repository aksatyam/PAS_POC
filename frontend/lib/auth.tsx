'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { api } from './api';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/profile');
      if (res.success) setUser(res.data);
    } catch {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      Cookies.set('accessToken', res.data.tokens.accessToken, { expires: 1 / 24 });
      Cookies.set('refreshToken', res.data.tokens.refreshToken, { expires: 7 });
      setUser(res.data.user);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
