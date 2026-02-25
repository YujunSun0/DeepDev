'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as authLib from '@/lib/auth';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  planType: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = authLib.getSavedUser();
    if (savedUser && authLib.getToken()) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authLib.login(email, password);
    setUser(res.user);
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await authLib.register(email, password, name);
    setUser(res.user);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    authLib.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, isLoading, login, register, logout };
}
