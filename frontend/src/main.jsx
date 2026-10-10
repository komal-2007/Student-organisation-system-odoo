import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AdminDashboard from './dashboards/admin/AdminDashboard.jsx';
import MemberDashboard from './dashboards/member/MemberDashboard.jsx';

function App() {
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    if (path === '/member' || search.get('view') === 'member' || search.get('role') === 'member') {
      return 'member';
    }
    return 'admin';
  };

  const [currentView, setCurrentView] = useState(getInitialView);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const switchView = (view) => {
    setCurrentView(view);
    const newPath = view === 'admin' ? '/admin' : '/member';
    window.history.pushState({}, '', newPath);
  };

  return (
    <div>
      {/* ── Skyline Dual-Dashboard Preview Switcher Bar ── */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        background: '#101426',
        color: '#fff',
        padding: '6px 8px',
        borderRadius: '30px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '12px',
        border: '1px solid rgba(255,255,255,0.15)'
      }}>
        <span style={{ padding: '0 8px', color: '#A7B0CC', fontWeight: 600, letterSpacing: '0.04em' }}>
          PREVIEW DASHBOARD:
        </span>

        <button
          onClick={() => switchView('admin')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            background: currentView === 'admin' ? '#7257E8' : 'transparent',
            color: '#fff',
            fontWeight: currentView === 'admin' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Dashboard 1 (Admin)
        </button>

        <button
          onClick={() => switchView('member')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            background: currentView === 'member' ? '#7257E8' : 'transparent',
            color: '#fff',
            fontWeight: currentView === 'member' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Dashboard 3 (Member)
        </button>
      </div>

      {/* ── Active Dashboard Render ── */}
      {currentView === 'admin' ? <AdminDashboard /> : <MemberDashboard />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
