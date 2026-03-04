import Cookies from 'js-cookie';
import { getMockResponse } from './mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number>;
}

async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // In demo mode, return mock data instead of calling the API
  if (IS_DEMO) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    const mock = getMockResponse(endpoint);
    if (mock) return mock as T;
  }

  const { params, ...fetchOpts } = options;
  let url = `${API_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const token = Cookies.get('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(fetchOpts.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...fetchOpts, headers });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = Cookies.get('accessToken');
      headers.Authorization = `Bearer ${newToken}`;
      const retryRes = await fetch(url, { ...fetchOpts, headers });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `HTTP ${retryRes.status}`);
      }
      return retryRes.json();
    }
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = Cookies.get('refreshToken');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.data?.tokens) {
      Cookies.set('accessToken', data.data.tokens.accessToken, { expires: 1 / 24 });
      Cookies.set('refreshToken', data.data.tokens.refreshToken, { expires: 7 });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, string | number>) =>
    fetchApi<T>(endpoint, { method: 'GET', params }),

  post: <T = any>(endpoint: string, body?: any) =>
    fetchApi<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T = any>(endpoint: string, body?: any) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch: <T = any>(endpoint: string, body?: any) =>
    fetchApi<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T = any>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};
