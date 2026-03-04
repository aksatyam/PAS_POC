'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { api } from './api';
import { getDemoUser, DEMO_USER } from './mock-data';
import { User, UserRole } from '@/types';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
    if (IS_DEMO) {
      // In demo mode, check if we have a stored demo session
      const demoSession = Cookies.get('demoUser');
      if (demoSession) {
        try {
          setUser(JSON.parse(demoSession));
        } catch {
          Cookies.remove('demoUser');
        }
      }
      setIsLoading(false);
      return;
    }

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
    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 500)); // Simulate delay
      const demoUser = getDemoUser(email, password);
      if (demoUser) {
        Cookies.set('demoUser', JSON.stringify(demoUser), { expires: 1 });
        Cookies.set('accessToken', 'demo-token', { expires: 1 });
        setUser(demoUser);
        return;
      }
      throw new Error('Invalid credentials. Use demo credentials (e.g. admin@imgc.com / demo123)');
    }

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
    if (IS_DEMO) {
      Cookies.remove('demoUser');
      Cookies.remove('accessToken');
      setUser(null);
      return;
    }
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
