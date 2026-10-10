import React, { useState } from 'react';
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

import StatCard from '../../features/common/StatCard';

/**
 * DASHBOARD 1: Admin / Club President
 * Role-restricted executive command center for club administration.
 */
export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData] = useState(ADMIN_MOCK_DATA);

  return (
    <div className="admin-dashboard-container">
      {/* Banner */}
      <div className="admin-header-banner">
        <div>
          <h1 className="admin-banner-title">Skyline Admin Control Center</h1>
          <p className="admin-banner-subtitle">
            Executive organization management, treasury balance, and operational permissions
          </p>
        </div>
        <div className="admin-badge-role">Role: Club President / Administrator</div>
      </div>

      {/* KPI Overview Grid */}
      <div className="admin-kpi-grid">
        <StatCard title="Total Members" value={adminData.stats.totalMembers} colorTheme="purple" />
        <StatCard title="Active Events" value={adminData.stats.activeEvents} colorTheme="emerald" />
        <StatCard title="Treasury Net Balance" value={adminData.stats.treasuryBalance} colorTheme="blue" />
        <StatCard title="Pending Approvals" value={adminData.stats.pendingApprovals} colorTheme="amber" />
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'finance', label: 'Finance & Ledger' },
          { id: 'reimbursements', label: 'Reimbursements Queue' },
          { id: 'events', label: 'Events Admin' },
          { id: 'members', label: 'Member Directory' },
          { id: 'volunteers', label: 'Volunteer Tasks' },
          { id: 'fundraising', label: 'Fundraising' },
          { id: 'announcements', label: 'Announcements' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Views */}
      <div className="admin-tab-content">
        {activeTab === 'overview' && <AdminOverview data={adminData} />}
        {activeTab === 'finance' && <AdminFinance financeData={adminData.financeSummary} />}
        {activeTab === 'reimbursements' && <AdminReimbursements initialQueue={adminData.reimbursementQueue} />}
        {activeTab === 'events' && <AdminEvents />}
        {activeTab === 'members' && <AdminMembers members={adminData.members} />}
        {activeTab === 'volunteers' && <AdminVolunteers tasks={adminData.volunteerTasks} />}
        {activeTab === 'fundraising' && <AdminFundraising campaigns={adminData.fundraisingCampaigns} />}
        {activeTab === 'announcements' && <AdminAnnouncements />}
      </div>
    </div>
  );
}

export default AdminDashboard;
