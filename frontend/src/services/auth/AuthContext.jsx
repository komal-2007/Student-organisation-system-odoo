import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, signIn as authenticate, signOut as endSession, updateProfile, updatePassword } from './authService';
import { notifyDataRefresh } from '../api/skylineApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        if (!active) return;
        setSessionError(error.message === 'Authentication is not configured. Set VITE_API_BASE_URL to your authentication API.'
          ? error.message
          : 'We couldn’t check your sign-in session. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function login(credentials) {
    const authenticatedUser = await authenticate(credentials);
    setUser(authenticatedUser);
    setSessionError('');
    return authenticatedUser;
  }

  async function logout() {
    await endSession();
    setUser(null);
    setSessionError('');
  }

  async function updateProfileLocal(updates) {
    const updatedUser = await updateProfile(updates);
    setUser(updatedUser);
    notifyDataRefresh('profile');
    return updatedUser;
  }

  async function changePassword(currentPassword, newPassword) {
    return await updatePassword(currentPassword, newPassword);
  }

  const value = useMemo(() => ({
    user,
    loading,
    sessionError,
    login,
    logout,
    updateProfile: updateProfileLocal,
    changePassword,
  }), [user, loading, sessionError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
