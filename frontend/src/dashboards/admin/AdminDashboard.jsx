import React, { useState, useRef, useEffect } from 'react';
import './AdminDashboard.css';
import ADMIN_MOCK_DATA from './data/adminMockData';

import AdminOverview from './components/AdminOverview';
import AdminFinance from './components/AdminFinance';
import AdminReimbursements from './components/AdminReimbursements';
import AdminEvents from './components/AdminEvents';
import AdminMembers from './components/AdminMembers';
import AdminVolunteers from './components/AdminVolunteers';
import AdminFundraising from './components/AdminFundraising';
import AdminAnnouncements from './components/AdminAnnouncements';

/* ── SVG Icon Components ── */
const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IconOverview = () => (
  <Icon>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
);

const IconEvents = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

const IconMembers = () => (
  <Icon>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

const IconFinance = () => (
  <Icon>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 10h20" />
    <path d="M6 14h2" />
    <path d="M12 14h6" />
  </Icon>
);

const IconReimbursements = () => (
  <Icon>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </Icon>
);

const IconAnnouncements = () => (
  <Icon>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);

const IconFundraising = () => (
  <Icon>
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
);

const IconVolunteers = () => (
  <Icon>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Icon>
);

const IconSearch = () => (
  <Icon size={18}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

const IconBell = () => (
  <Icon size={20}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);

/* ── Navigation Items ── */
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: IconOverview },
  { id: 'events', label: 'Events & Tickets', icon: IconEvents },
  { id: 'members', label: 'Members', icon: IconMembers },
  { id: 'finance', label: 'Finance & Ledger', icon: IconFinance },
  { id: 'reimbursements', label: 'Reimbursements', icon: IconReimbursements },
  { id: 'announcements', label: 'Announcements', icon: IconAnnouncements },
  { id: 'fundraising', label: 'Fundraising', icon: IconFundraising },
  { id: 'volunteers', label: 'Volunteers', icon: IconVolunteers },
];

import { useAuth } from '../../services/auth/AuthContext';

/**
 * DASHBOARD 1: Admin / Club President
 * Role-restricted executive command center for club administration.
 */
export function AdminDashboard() {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [adminData] = useState(ADMIN_MOCK_DATA);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sectionTitles = {
    overview: { title: 'Executive Overview', subtitle: `Skyline Organization Portal • Managing Fall Semester 2026 operations` },
    events: { title: 'Events & Tickets', subtitle: 'Create, manage, and track all organization events' },
    members: { title: 'Member Directory', subtitle: 'View and manage organization membership' },
    finance: { title: 'Finance & Ledger', subtitle: 'Treasury overview, income, expenses, and transactions' },
    reimbursements: { title: 'Reimbursement Queue', subtitle: 'Review and process pending reimbursement claims' },
    announcements: { title: 'Announcements', subtitle: 'Broadcast updates to organization members' },
    fundraising: { title: 'Fundraising Campaigns', subtitle: 'Track active campaigns and fundraising progress' },
    volunteers: { title: 'Volunteer Tasks', subtitle: 'Assign, track, and manage volunteer work' },
  };

  const current = sectionTitles[activeSection];

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">S</div>
          <div>
            <div className="sidebar-brand-name">Skyline</div>
            <div className="sidebar-brand-role">CLUB ADMIN</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const NavIcon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <NavIcon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Area ── */}
      <div className="admin-main">
        {/* ── Top Navbar ── */}
        <header className="admin-topbar">
          <div className="topbar-search">
            <IconSearch />
            <input type="text" placeholder="Search members, claims, events..." />
          </div>

          <div className="topbar-actions">
            {/* Notification Bell */}
            <div className="topbar-dropdown" ref={notifRef}>
              <button className="topbar-icon-btn" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
                <IconBell />
                <span className="notif-dot" />
              </button>
              {notifOpen && (
                <div className="dropdown-panel notif-panel">
                  <div className="dropdown-header">Notifications</div>
                  <div className="dropdown-item">New reimbursement from Sarah Jenkins</div>
                  <div className="dropdown-item">David Chen membership request</div>
                  <div className="dropdown-item">HackCampus 2026 — 87% capacity</div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="topbar-dropdown" ref={profileRef}>
              <button className="topbar-profile-btn" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
                <div className="topbar-avatar">KB</div>
                <div className="topbar-profile-info">
                  <span className="topbar-profile-name">Komal Bhatia</span>
                  <span className="topbar-profile-role">Club President</span>
                </div>
              </button>
              {profileOpen && (
                <div className="dropdown-panel profile-panel">
                  <div className="dropdown-item" onMouseDown={(e) => { e.stopPropagation(); alert('My Profile (Mock)'); setProfileOpen(false); }}>My Profile</div>
                  <div className="dropdown-item" onMouseDown={(e) => { e.stopPropagation(); alert('Settings (Mock)'); setProfileOpen(false); }}>Settings</div>
                  <div className="dropdown-item" onMouseDown={async (e) => { 
                    e.stopPropagation(); 
                    setProfileOpen(false); 
                    await logout(); 
                  }}>Sign Out</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Header ── */}
        <div className="admin-page-header">
          <div>
            <h1 className="page-title">{current.title}</h1>
            <p className="page-subtitle">{current.subtitle}</p>
          </div>
          {activeSection === 'overview' && (
            <button className="btn-create-event" onClick={() => setActiveSection('events')}>+ Create Event</button>
          )}
        </div>

        {/* ── KPI Cards (Overview only) ── */}
        {activeSection === 'overview' && (
          <div className="admin-kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon purple"><IconMembers /></div>
              <div>
                <div className="kpi-value">{adminData.stats.totalMembers}</div>
                <div className="kpi-label">Total Members</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon teal"><IconEvents /></div>
              <div>
                <div className="kpi-value">{adminData.stats.activeEvents}</div>
                <div className="kpi-label">Active Events</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon blue"><IconFinance /></div>
              <div>
                <div className="kpi-value">{adminData.stats.treasuryBalance}</div>
                <div className="kpi-label">Treasury Net Balance</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon coral"><IconVolunteers /></div>
              <div>
                <div className="kpi-value">{adminData.stats.pendingApprovals}</div>
                <div className="kpi-label">Pending Approvals</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Section Content ── */}
        <div className="admin-content">
          {activeSection === 'overview' && <AdminOverview data={adminData} />}
          {activeSection === 'finance' && <AdminFinance financeData={adminData.financeSummary} />}
          {activeSection === 'reimbursements' && <AdminReimbursements initialQueue={adminData.reimbursementQueue} />}
          {activeSection === 'events' && <AdminEvents events={adminData.events} eventAttendees={adminData.eventAttendees} />}
          {activeSection === 'members' && <AdminMembers members={adminData.members} />}
          {activeSection === 'volunteers' && <AdminVolunteers tasks={adminData.volunteerTasks} />}
          {activeSection === 'fundraising' && <AdminFundraising campaigns={adminData.fundraisingCampaigns} />}
          {activeSection === 'announcements' && <AdminAnnouncements announcements={adminData.announcements} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
