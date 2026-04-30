import { AuthSession, FeedbackPayload, LoginPayload, MealPlan, Profile, RegisterPayload } from './types';

const API_BASE = '/api';
const SESSION_STORAGE_KEY = 'nutrify-auth-session';

async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const message = contentType.includes('application/json')
      ? JSON.stringify(await response.json())
      : await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function storeSession(session: AuthSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function loginUser(payload: LoginPayload) {
  const session = await apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  storeSession(session);
  return session;
}

export async function registerUser(payload: RegisterPayload) {
  const session = await apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  storeSession(session);
  return session;
}

export function getCurrentUser(token: string) {
  return apiRequest<AuthSession['user']>('/auth/me', {}, token);
}

export function getProfile(token: string) {
  return apiRequest<Profile>('/user/profile', {}, token);
}

export function saveProfile(token: string, profile: Profile) {
  return apiRequest<Profile>('/user/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  }, token);
}

export function getMealHistory(token: string) {
  return apiRequest<MealPlan[]>('/meal/history', {}, token);
}

export function generateMealPlan(token: string) {
  return apiRequest<MealPlan>('/meal/generate', {
    method: 'POST',
  }, token);
}

export function submitFeedback(token: string, payload: FeedbackPayload) {
  return apiRequest<string>('/feedback/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}
