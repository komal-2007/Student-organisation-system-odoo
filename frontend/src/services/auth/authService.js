const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const VALID_ROLES = new Set(['admin', 'member', 'core_member']);
const DEMO_SESSION_KEY = 'skyline-core-member-demo-session';
const DEMO_USER = { id: 'demo-core-member', username: 'core_mem', role: 'core_member' };

function usesCoreMemberDemoAuth() {
  return import.meta.env.DEV && !API_BASE_URL;
}

function invalidCredentialsError() {
  const error = new Error('Username or password is incorrect.');
  error.code = 'INVALID_CREDENTIALS';
  return error;
}

export function dashboardPathForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'core_member') return '/core-member';
  if (role === 'member') return '/member';
  return '/signin';
}

function normalizeRole(role) {
  const normalized = String(role ?? '').trim().toLowerCase().replaceAll(/[\s-]+/g, '_');
  if (normalized === 'department_head' || normalized === 'coremember') return 'core_member';
  return VALID_ROLES.has(normalized) ? normalized : null;
}

function normalizeUser(payload) {
  const user = payload?.user;
  const role = normalizeRole(user?.role);
  if (!user || typeof user.id !== 'string' || typeof user.username !== 'string' || !role) {
    throw new Error('The authentication service returned an invalid user profile.');
  }
  return { id: user.id, username: user.username, role };
}

async function apiRequest(endpoint, body) {
  if (!API_BASE_URL) {
    throw new Error('Authentication is not configured. Set VITE_API_BASE_URL to your authentication API.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401) {
    const error = new Error('Username or password is incorrect.');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }
  if (!response.ok) {
    throw new Error(`Authentication service request failed (HTTP ${response.status}).`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function signIn(credentials) {
  if (usesCoreMemberDemoAuth()) {
    if (credentials.username !== 'core_mem' || credentials.password !== 'Core123') {
      throw invalidCredentialsError();
    }
    sessionStorage.setItem(DEMO_SESSION_KEY, 'signed-in');
    return DEMO_USER;
  }
  return normalizeUser(await apiRequest('/auth/login', credentials));
}

export async function getCurrentUser() {
  if (usesCoreMemberDemoAuth()) {
    return sessionStorage.getItem(DEMO_SESSION_KEY) === 'signed-in' ? DEMO_USER : null;
  }
  try {
    return normalizeUser(await apiRequest('/auth/session'));
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') return null;
    throw error;
  }
}

export async function signOut() {
  if (usesCoreMemberDemoAuth()) {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }
  await apiRequest('/auth/logout', {});
}
