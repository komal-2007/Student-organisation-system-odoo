import React, { useState } from 'react';
import './MemberDashboard.css';
import MEMBER_MOCK_DATA from './data/memberMockData';

import MyMembershipCard from './components/MyMembershipCard';
import MyTickets from './components/MyTickets';
import MemberEvents from './components/MemberEvents';
import MyReimbursements from './components/MyReimbursements';
import MyVolunteerTasks from './components/MyVolunteerTasks';
import MemberMerchStore from './components/MemberMerchStore';
import MemberAnnouncements from './components/MemberAnnouncements';

/**
 * DASHBOARD 3: Registered Member
 * Personalized dashboard for authenticated student members.
 * Strictly isolates personal data; contains NO admin ledgers or approvals.
 */
export function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [memberData] = useState(MEMBER_MOCK_DATA);

  return (
    <div className="member-dashboard-container">
      {/* Banner */}
      <div className="member-header-banner">
        <div>
          <h1 className="member-banner-title">Welcome Back, {memberData.profile.name}!</h1>
          <p className="member-banner-subtitle">
            Skyline Student Portal • Manage your tickets, membership, and personal requests
          </p>
        </div>
      </div>

      {/* Digital Member Pass Banner */}
      <MyMembershipCard profile={memberData.profile} />

      {/* Navigation Tabs */}
      <div className="member-tabs-nav">
        {[
          { id: 'tickets', label: 'My Event Passes & Tickets' },
          { id: 'events', label: 'Discover Events' },
          { id: 'reimbursements', label: 'My Expense Claims' },
          { id: 'tasks', label: 'My Volunteer Tasks' },
          { id: 'merch', label: 'Club Store & My Orders' },
          { id: 'announcements', label: 'Announcements' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`member-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Views */}
      <div className="member-tab-content">
        {activeTab === 'tickets' && <MyTickets tickets={memberData.myTickets} />}
        {activeTab === 'events' && <MemberEvents />}
        {activeTab === 'reimbursements' && <MyReimbursements initialClaims={memberData.myReimbursementClaims} />}
        {activeTab === 'tasks' && <MyVolunteerTasks initialTasks={memberData.myVolunteerTasks} />}
        {activeTab === 'merch' && <MemberMerchStore catalog={memberData.merchandiseCatalog} myOrders={memberData.myMerchOrders} />}
        {activeTab === 'announcements' && <MemberAnnouncements />}
      </div>
    </div>
  );
}

export default MemberDashboard;
