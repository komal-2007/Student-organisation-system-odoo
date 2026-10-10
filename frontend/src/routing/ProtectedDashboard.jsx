import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { dashboardPathForRole } from '../services/auth/authService';
import { useAuth } from '../services/auth/AuthContext';

function ProtectedDashboard({ role, children }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <main className="dashboard-access-loading" role="status">Checking your Skyline session…</main>;
  }
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  if (user.role !== role) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  async function signOut() {
    setError('');
    setSubmitting(true);
    try {
      await logout();
      navigate('/signin', { replace: true });
    } catch {
      setError('Sign out could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {children}
      <div className="dashboard-session-control">
        {error && <p className="dashboard-signout-error" role="alert">{error}</p>}
        <button type="button" className="dashboard-signout-button" onClick={signOut} disabled={submitting}>
          <LogOut size={15} aria-hidden="true" /> {submitting ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  );
}

export default ProtectedDashboard;
