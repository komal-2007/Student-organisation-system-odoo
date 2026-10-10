import React, { useState } from 'react';

/* ── Outline SVG Icons ── */
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export function MemberAnnouncements({ announcements = [] }) {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Meeting', 'Event Alert', 'Finance'];

  const filteredAnnouncements = filter === 'All'
    ? announcements
    : announcements.filter((a) => a.category === filter);

  return (
    <div className="member-announcements-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">
              <IconBell />
              <span>Member Announcements Feed</span>
            </h3>
            <p className="skyline-card-subtitle">
              Official campus organization broadcasts, deadline reminders, and executive notices
            </p>
          </div>
          <span className="skyline-badge badge-active">{announcements.length} Published</span>
        </div>

        {/* Filter Pills */}
        <div className="events-category-filters" style={{ marginBottom: '20px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feed List */}
        <div className="announcements-feed-container">
          {filteredAnnouncements.map((ann) => (
            <div key={ann.id} className="announcement-feed-card">
              <div className="ann-card-header">
                <div className="ann-badge-group">
                  <span className="skyline-badge badge-low">{ann.category}</span>
                  <span className={`skyline-badge badge-${ann.priority?.toLowerCase() === 'high' ? 'high' : 'medium'}`}>
                    {ann.priority} Priority
                  </span>
                </div>
                <div className="ann-date-stamp">
                  <IconCalendar />
                  <span>{ann.date}</span>
                </div>
              </div>

              <h4 className="ann-heading">{ann.title}</h4>
              <p className="ann-body-content">{ann.content}</p>

              <div className="ann-card-footer">
                <span className="ann-author">
                  <IconUser /> Posted by {ann.author}
                </span>
              </div>
            </div>
          ))}

          {filteredAnnouncements.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#667085' }}>
              No announcements found for this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberAnnouncements;
