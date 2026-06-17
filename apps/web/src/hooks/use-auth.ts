'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import * as authLib from '@/lib/auth';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  planType: string;
  preferredLanguage?: string | null;
  emailVerified?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  completeOAuthLogin: (accessToken: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  completeOAuthLogin: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const token = authLib.getToken();
      const savedUser = authLib.getSavedUser();
      if (token && savedUser) {
        setUser(savedUser);
        const updated = await authLib.refreshUser();
        if (updated) setUser(updated);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authLib.login(email, password);
    setUser(res.user);
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await authLib.register(email, password, name);
    if ('requiresVerification' in res && res.requiresVerification) {
      router.push(`/login?registered=${encodeURIComponent(res.message ?? '')}`);
      return;
    }
    if (res.user) {
      setUser(res.user);
      router.push('/dashboard');
    }
  }, [router]);

  const logout = useCallback(() => {
    authLib.logout();
    queryClient.clear();
    setUser(null);
    router.push('/login');
  }, [router, queryClient]);

  const refreshUser = useCallback(async () => {
    const updated = await authLib.refreshUser();
    if (updated) setUser(updated);
  }, []);

  const completeOAuthLogin = useCallback(async (accessToken: string) => {
    const updated = await authLib.loginWithOAuthToken(accessToken);
    if (!updated) {
      throw new Error('OAuth login failed');
    }
    setUser(updated);
    router.replace('/dashboard');
  }, [router]);

  return { user, isLoading, login, register, logout, refreshUser, completeOAuthLogin };
}
