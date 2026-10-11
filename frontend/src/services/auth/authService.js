const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api').replace(/\/+$/, '');
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const AUTH_SESSION_KEY = 'skyline-auth-session';
const LEGACY_DEMO_SESSION_KEY = 'skyline-demo-session';
const ROLE_MAP = new Map([
  ['ADMIN', 'admin'],
  ['STUDENT', 'member'],
]);
let refreshInFlight;

function missingConfiguration() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!SUPABASE_API_KEY) missing.push('VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  return missing;
}

function requireProviderConfiguration() {
  const missing = missingConfiguration();
  if (missing.length > 0) {
    throw new Error(`Authentication is not configured. Set ${missing.join(' and ')}.`);
  }
}

function readSession() {
  const serialized = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!serialized) return null;

  try {
    const session = JSON.parse(serialized);
    if (
      typeof session.accessToken !== 'string' ||
      typeof session.refreshToken !== 'string' ||
      !Number.isFinite(session.expiresAt)
    ) {
      throw new Error('Stored authentication session is invalid.');
    }
    return session;
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

function writeSession(session) {
  const expiresIn = Number(session.expires_in);
  if (
    typeof session.access_token !== 'string' ||
    typeof session.refresh_token !== 'string' ||
    !Number.isFinite(expiresIn) ||
    expiresIn <= 0
  ) {
    throw new Error('Supabase Auth returned an invalid session.');
  }

  const stored = {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(stored));
  return stored;
}

async function readResponse(response, label) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error;
    const error = new Error(`${message || label} (HTTP ${response.status}).`);
    if (response.status === 400 || response.status === 401) {
      error.code = 'INVALID_CREDENTIALS';
    }
    throw error;
  }
  return data;
}

async function providerRequest(path, body, accessToken) {
  requireProviderConfiguration();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_API_KEY,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return readResponse(response, 'Supabase authentication request');
}

function normalizeUser(profile) {
  const user = profile?.user;
  const role = ROLE_MAP.get(user?.role);
  if (
    typeof user?.id !== 'string' ||
    typeof user?.email !== 'string' ||
    typeof user?.fullName !== 'string' ||
    !role
  ) {
    const unsupportedRole = user?.role ? ` (${user.role})` : '';
    throw new Error(`The backend profile is incomplete or has no supported Skyline dashboard${unsupportedRole}.`);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    role,
    studentId: user.studentId ?? undefined,
  };
}

async function fetchProfile(accessToken) {
  const response = await fetch(`${API_BASE_URL}/me/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return normalizeUser(await readResponse(response, 'Skyline profile request'));
}

async function refreshSession(session) {
  try {
    const refreshed = await providerRequest('token?grant_type=refresh_token', {
      refresh_token: session.refreshToken,
    });
    return writeSession(refreshed);
  } catch (error) {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    throw error;
  }
}

export async function getAccessToken() {
  const session = readSession();
  if (!session) return null;
  if (session.expiresAt <= Date.now() + 60_000) {
    if (!refreshInFlight) {
      refreshInFlight = refreshSession(session).finally(() => {
        refreshInFlight = undefined;
      });
    }
    return (await refreshInFlight).accessToken;
  }
  return session.accessToken;
}

export function dashboardPathForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'member') return '/member';
  return '/signin';
}

export async function signIn(credentials) {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(LEGACY_DEMO_SESSION_KEY);
  const result = await providerRequest('token?grant_type=password', {
    email: credentials.email,
    password: credentials.password,
  });
  const user = await fetchProfile(result.access_token);
  writeSession(result);
  sessionStorage.removeItem(LEGACY_DEMO_SESSION_KEY);
  return user;
}

export async function getCurrentUser() {
  sessionStorage.removeItem(LEGACY_DEMO_SESSION_KEY);
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    return await fetchProfile(accessToken);
  } catch (error) {
    if (/HTTP 401\b/.test(error.message)) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
    throw error;
  }
}

export async function updateProfile() {
  throw new Error('Profile updates are not supported by the current backend.');
}

export async function updatePassword() {
  throw new Error('Password updates are not supported by the current backend.');
}

export async function signOut() {
  const session = readSession();
  sessionStorage.removeItem(LEGACY_DEMO_SESSION_KEY);
  try {
    if (session) {
      const accessToken = await getAccessToken();
      if (accessToken) await providerRequest('logout', {}, accessToken);
    }
  } finally {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  }
}
