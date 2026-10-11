import { useState } from 'react';
import { useAuth } from '../../services/auth/AuthContext';

export function SharedProfile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    title: user?.title || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="account-card">
        <h2>Please sign in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="account-card" style={{ maxWidth: '600px', margin: '0 auto', background: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E2E6F0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#101426', marginBottom: '16px' }}>My Profile</h2>
      <p style={{ color: '#667085', fontSize: '14px', marginBottom: '24px' }}>
        Update your personal details and public profile information.
      </p>

      {message.text && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '4px', fontSize: '14px', background: message.type === 'error' ? '#FEF3F2' : '#ECFDF3', color: message.type === 'error' ? '#B42318' : '#027A48' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#101426' }}>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ padding: '8px 12px', border: '1px solid #E2E6F0', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#101426' }}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ padding: '8px 12px', border: '1px solid #E2E6F0', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        {user.role === 'admin' || user.role === 'core_member' ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#101426' }}>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={{ padding: '8px 12px', border: '1px solid #E2E6F0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
          </>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '8px 16px', background: '#7257E8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
