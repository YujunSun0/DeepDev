import { api } from './api';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  planType: string;
  preferredLanguage?: string | null;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

interface RegisterResponse {
  accessToken?: string;
  user?: AuthUser;
  message?: string;
  requiresVerification?: boolean;
}

const TOKEN_KEY = 'deepdev_token';
const USER_KEY = 'deepdev_user';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  saveAuth(data);
  return data;
}

export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse | RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/auth/register', {
    email,
    password,
    name,
  });
  if (data.accessToken && data.user) {
    saveAuth(data as AuthResponse);
  }
  return data;
}

function saveAuth(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSavedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function refreshUser(): Promise<AuthUser | null> {
  if (typeof window === 'undefined' || !getToken()) return null;
  try {
    const { data } = await api.get<AuthUser>('/users/me');
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}

export async function updateProfile(payload: {
  name?: string;
  preferredLanguage?: string | null;
}): Promise<AuthUser | null> {
  if (typeof window === 'undefined' || !getToken()) return null;
  try {
    const { data } = await api.patch<AuthUser>('/users/me', payload);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: AuthUser;
}

export async function verifyEmailAndLogin(token: string): Promise<VerifyEmailResponse> {
  const { data } = await api.get<VerifyEmailResponse>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  if (data.accessToken && data.user) {
    saveAuth({ accessToken: data.accessToken, user: data.user });
  }
  return data;
}
