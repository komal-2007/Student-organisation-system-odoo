import { useState } from 'react';
import { useAuth } from '../../services/auth/AuthContext';

export function SharedSettings() {
  const { user, changePassword } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="account-card" style={{ maxWidth: '600px', margin: '0 auto', background: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E2E6F0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#101426', marginBottom: '16px' }}>Account Settings</h2>
      <p style={{ color: '#667085', fontSize: '14px', marginBottom: '24px' }}>
        Manage your account security and preferences.
      </p>

      {message.text && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '4px', fontSize: '14px', background: message.type === 'error' ? '#FEF3F2' : '#ECFDF3', color: message.type === 'error' ? '#B42318' : '#027A48' }}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #E2E6F0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#101426', marginBottom: '12px' }}>Security (Change Password)</h3>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#101426' }}>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleChange}
              required
              style={{ padding: '8px 12px', border: '1px solid #E2E6F0', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#101426' }}>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              required
              style={{ padding: '8px 12px', border: '1px solid #E2E6F0', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#101426' }}>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              required
              style={{ padding: '8px 12px', border: '1px solid #E2E6F0', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '4px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', background: '#7257E8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#101426', marginBottom: '12px' }}>Appearance</h3>
        <p style={{ color: '#667085', fontSize: '14px', marginBottom: '12px' }}>
          Skyline defaults to a clean light-theme design system.
        </p>
        <div style={{ padding: '12px', background: '#F4F5FB', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', border: '2px solid #7257E8' }} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#101426' }}>Light Theme (Active)</span>
        </div>
      </div>
    </div>
  );
}
