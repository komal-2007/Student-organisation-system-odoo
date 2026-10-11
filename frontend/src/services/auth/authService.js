const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const VALID_ROLES = new Set(['admin', 'member', 'core_member']);
const DEMO_SESSION_KEY = 'skyline-demo-session';
const DEMO_USERS_KEY = 'skyline-demo-users';

const defaultDemoUsers = {
  admin1: { id: 'demo-admin', username: 'admin1', name: 'Komal Bhatia', email: 'komal@skyline.edu', role: 'admin', password: 'admin123', department: 'Executive', title: 'Club President' },
  mem1: { id: 'demo-member', username: 'mem1', name: 'Alex Johnson', email: 'alex.j@skyline.edu', role: 'member', password: 'mem123', membershipTier: 'Premium', studentId: 'ST-92841' },
  core_mem: { id: 'demo-core-member', username: 'core_mem', name: 'Morgan Chen', email: 'morgan@skyline.edu', role: 'core_member', password: 'Core123', department: 'Marketing' }
};

function getDemoUsers() {
  try {
    const stored = localStorage.getItem(DEMO_USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // Ignore parse errors
  }
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(defaultDemoUsers));
  return defaultDemoUsers;
}

function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
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
  const user = payload?.user || payload;
  const role = normalizeRole(user?.role);
  if (!user || typeof user.id !== 'string' || typeof user.username !== 'string' || !role) {
    throw new Error('The authentication service returned an invalid user profile.');
  }
  return { ...user, role };
}

async function apiRequest(endpoint, body, methodOverride) {
  const sessionUser = sessionStorage.getItem(DEMO_SESSION_KEY);
  const method = methodOverride || (body === undefined ? 'GET' : 'POST');
  const headers = { 'Content-Type': 'application/json' };
  if (sessionUser) {
    headers.Authorization = 'Bearer ' + sessionUser;
    headers['X-User-Id'] = sessionUser;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
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
  try {
    const result = await apiRequest('/auth/login', credentials);
    const user = normalizeUser(result);
    sessionStorage.setItem(DEMO_SESSION_KEY, user.username);
    return user;
  } catch (err) {
    const users = getDemoUsers();
    const user = users[credentials.username];
    if (!user || user.password !== credentials.password) {
      throw invalidCredentialsError();
    }
    sessionStorage.setItem(DEMO_SESSION_KEY, user.username);
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

export async function getCurrentUser() {
  const sessionUser = sessionStorage.getItem(DEMO_SESSION_KEY);
  if (!sessionUser) return null;

  try {
    const result = await apiRequest('/auth/session');
    return normalizeUser(result);
  } catch (error) {
    const users = getDemoUsers();
    if (sessionUser && users[sessionUser]) {
      const { password, ...safeUser } = users[sessionUser];
      return safeUser;
    }
    return null;
  }
}

export async function updateProfile(updates) {
  const result = await apiRequest('/user/profile', updates, 'PUT');
  return normalizeUser(result);
}

export async function updatePassword(currentPassword, newPassword) {
  const sessionUser = sessionStorage.getItem(DEMO_SESSION_KEY);
  try {
    await apiRequest('/user/password', { currentPassword, newPassword });
    return true;
  } catch (err) {
    const users = getDemoUsers();
    if (!sessionUser || !users[sessionUser]) throw new Error('Not authenticated');
    if (users[sessionUser].password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    users[sessionUser].password = newPassword;
    saveDemoUsers(users);
    return true;
  }
}

export async function signOut() {
  const sessionUser = sessionStorage.getItem(DEMO_SESSION_KEY);
  try {
    await apiRequest('/auth/logout', {});
  } catch (err) {
    // Ignore error on logout
  }
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}
