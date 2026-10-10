import React, { useState, useRef, useEffect } from 'react';
import './MemberDashboard.css';
import MEMBER_MOCK_DATA from './data/memberMockData';

import MemberOverview from './components/MemberOverview';
import MyMembershipCard from './components/MyMembershipCard';
import MyTickets from './components/MyTickets';
import MemberEvents from './components/MemberEvents';
import MyReimbursements from './components/MyReimbursements';
import MyVolunteerTasks from './components/MyVolunteerTasks';
import MemberMerchStore from './components/MemberMerchStore';
import MemberAnnouncements from './components/MemberAnnouncements';

/* ── SVG Outline Icons ── */
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

const IconTicket = () => (
  <Icon>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
  </Icon>
);

const IconIdBadge = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <line x1="15" y1="8" x2="17" y2="8" />
    <line x1="15" y1="12" x2="17" y2="12" />
    <line x1="7" y1="16" x2="17" y2="16" />
  </Icon>
);

const IconCompass = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </Icon>
);

const IconReceipt = () => (
  <Icon>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
    <path d="M16 8h-8" />
    <path d="M16 12h-8" />
  </Icon>
);

const IconCheckSquare = () => (
  <Icon>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Icon>
);

const IconShoppingBag = () => (
  <Icon>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Icon>
);

const IconBell = () => (
  <Icon>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);

const IconSearch = () => (
  <Icon size={18}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

/* ── Member Sidebar Navigation ── */
const MEMBER_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: IconOverview },
  { id: 'tickets', label: 'My Event Passes', icon: IconTicket },
  { id: 'membership', label: 'My Membership Pass', icon: IconIdBadge },
  { id: 'events', label: 'Discover Events', icon: IconCompass },
  { id: 'reimbursements', label: 'My Expense Claims', icon: IconReceipt },
  { id: 'tasks', label: 'Volunteer Tasks', icon: IconCheckSquare },
  { id: 'merch', label: 'Club Store & Orders', icon: IconShoppingBag },
  { id: 'announcements', label: 'Announcements', icon: IconBell },
];

/**
 * DASHBOARD 3: Registered Member
 * Personalized portal for authenticated student members.
 * Strictly isolates personal data; contains NO admin ledgers or approvals.
 */
export function MemberDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [memberData] = useState(MEMBER_MOCK_DATA);
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
    overview: {
      title: 'Student Member Overview',
      subtitle: `Welcome back, ${memberData.profile.name} • Skyline Student Portal (Fall 2026)`,
    },
    tickets: {
      title: 'My Event Passes & Admission',
      subtitle: 'Confirmed event registrations and admission passes reserved under your student profile',
    },
    membership: {
      title: 'My Digital Membership Pass',
      subtitle: 'Verified campus standing, active credentials, and renewal status',
    },
    events: {
      title: 'Discover Campus Events',
      subtitle: 'Explore upcoming organization workshops, hackathons, and gatherings open for RSVP',
    },
    reimbursements: {
      title: 'My Expense Reimbursements',
      subtitle: 'Submit personal out-of-pocket expenses and track reimbursement approval status',
    },
    tasks: {
      title: 'My Assigned Volunteer Tasks',
      subtitle: 'Manage your active operational assignments and volunteer deadlines',
    },
    merch: {
      title: 'Club Store & My Orders',
      subtitle: 'Official Skyline apparel, accessories, and personal order tracking',
    },
    announcements: {
      title: 'Member Announcements Feed',
      subtitle: 'Official organization updates, deadline alerts, and campus notices',
    },
  };

  const current = sectionTitles[activeSection] || sectionTitles.overview;

  return (
    <div className="member-shell">
      {/* ── Left Sidebar ── */}
      <aside className="member-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">S</div>
          <div>
            <div className="sidebar-brand-name">Skyline</div>
            <div className="sidebar-brand-role member-role-tag">MEMBER PORTAL</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {MEMBER_NAV_ITEMS.map((item) => {
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

        {/* Sidebar Footer User Badge */}
        <div className="sidebar-member-badge">
          <div className="sidebar-member-avatar">AJ</div>
          <div className="sidebar-member-text">
            <span className="member-name-small">{memberData.profile.name}</span>
            <span className="member-tier-small">{memberData.profile.membershipTier}</span>
          </div>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <div className="member-main">
        {/* ── Top Navbar ── */}
        <header className="member-topbar">
          <div className="topbar-search">
            <IconSearch />
            <input type="text" placeholder="Search my passes, events, orders..." />
          </div>

          <div className="topbar-actions">
            {/* Notification Bell */}
            <div className="topbar-dropdown" ref={notifRef}>
              <button
                className="topbar-icon-btn"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
              >
                <IconBell />
                <span className="notif-dot" />
              </button>
              {notifOpen && (
                <div className="dropdown-panel notif-panel">
                  <div className="dropdown-header">Member Notifications</div>
                  <div className="dropdown-item">Workshop Snacks claim approved ($42.50)</div>
                  <div className="dropdown-item">HackCampus 2026 pass confirmed</div>
                  <div className="dropdown-item">Volunteer table duty reminder for Oct 24</div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="topbar-dropdown" ref={profileRef}>
              <button
                className="topbar-profile-btn"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
              >
                <div className="topbar-avatar member-avatar-grad">AJ</div>
                <div className="topbar-profile-info">
                  <span className="topbar-profile-name">{memberData.profile.name}</span>
                  <span className="topbar-profile-role">{memberData.profile.role}</span>
                </div>
              </button>
              {profileOpen && (
                <div className="dropdown-panel profile-panel">
                  <button
                    type="button"
                    className="dropdown-item"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setActiveSection('membership');
                      setProfileOpen(false);
                    }}
                  >
                    My Digital Pass
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setActiveSection('reimbursements');
                      setProfileOpen(false);
                    }}
                  >
                    My Claims
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setProfileOpen(false);
                      alert('Signed out successfully.');
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Header ── */}
        <div className="member-page-header">
          <div>
            <h1 className="page-title">{current.title}</h1>
            <p className="page-subtitle">{current.subtitle}</p>
          </div>
        </div>

        {/* ── Dynamic Content Section ── */}
        <div className="member-content">
          {activeSection === 'overview' && (
            <MemberOverview data={memberData} onNavigate={setActiveSection} />
          )}
          {activeSection === 'tickets' && (
            <MyTickets tickets={memberData.myTickets} />
          )}
          {activeSection === 'membership' && (
            <MyMembershipCard profile={memberData.profile} />
          )}
          {activeSection === 'events' && (
            <MemberEvents events={memberData.discoverEvents} />
          )}
          {activeSection === 'reimbursements' && (
            <MyReimbursements initialClaims={memberData.myReimbursementClaims} />
          )}
          {activeSection === 'tasks' && (
            <MyVolunteerTasks initialTasks={memberData.myVolunteerTasks} />
          )}
          {activeSection === 'merch' && (
            <MemberMerchStore catalog={memberData.merchandiseCatalog} myOrders={memberData.myMerchOrders} />
          )}
          {activeSection === 'announcements' && (
            <MemberAnnouncements announcements={memberData.announcements} />
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
