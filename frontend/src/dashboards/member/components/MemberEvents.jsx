import React, { useState } from 'react';

/* ── Outline SVG Icons ── */
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconCompass = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export function MemberEvents({ events = [] }) {
  const [eventList, setEventList] = useState(events);
  const [activeCategory, setActiveCategory] = useState('All');
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [confirmedMessage, setConfirmedMessage] = useState(null);

  const categories = ['All', 'Hackathon', 'Workshop', 'Social', 'Tech', 'Leadership'];

  const filteredEvents = activeCategory === 'All'
    ? eventList
    : eventList.filter((e) => e.category === activeCategory);

  const handleRegister = (eventId) => {
    setEventList((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, isRegistered: true, registered: e.registered + 1 }
          : e
      )
    );
    setConfirmedMessage('Your RSVP has been confirmed! A digital admission pass has been added to My Passes.');
    setTimeout(() => {
      setRsvpEvent(null);
      setConfirmedMessage(null);
    }, 2000);
  };

  return (
    <div className="member-events-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">
              <IconCompass />
              <span>Discover Campus Events</span>
            </h3>
            <p className="skyline-card-subtitle">
              Browse upcoming Skyline student workshops, hackathons, and gatherings open for member registration
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="events-category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="events-catalog-grid">
          {filteredEvents.map((evt) => {
            const percent = Math.round((evt.registered / evt.capacity) * 100);
            return (
              <div key={evt.id} className="event-catalog-card">
                <div className="catalog-card-header">
                  <span className="skyline-badge badge-low">{evt.category}</span>
                  <span className="event-seats-tag">
                    {evt.capacity - evt.registered} seats left
                  </span>
                </div>

                <h4 className="catalog-event-title">{evt.title}</h4>
                <p className="catalog-event-desc">{evt.description}</p>

                <div className="catalog-event-meta">
                  <div className="meta-line">
                    <IconCalendar />
                    <span>{evt.date}</span>
                  </div>
                  <div className="meta-line">
                    <IconClock />
                    <span>{evt.time}</span>
                  </div>
                  <div className="meta-line">
                    <IconMapPin />
                    <span>{evt.venue}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="catalog-capacity-wrap">
                  <div className="capacity-label-row">
                    <span>Capacity Filled</span>
                    <span>{evt.registered} / {evt.capacity} ({percent}%)</span>
                  </div>
                  <div className="capacity-progress-track">
                    <div
                      className="capacity-progress-bar"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Registration Button */}
                <div className="catalog-card-footer">
                  {evt.isRegistered ? (
                    <button className="btn-registered" disabled>
                      Registered (Pass in Wallet)
                    </button>
                  ) : (
                    <button
                      className="btn-rsvp-primary"
                      onClick={() => setRsvpEvent(evt)}
                    >
                      Register for Event
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RSVP Confirmation Modal ── */}
      {rsvpEvent && (
        <div className="skyline-modal-overlay" onClick={() => setRsvpEvent(null)}>
          <div className="skyline-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="skyline-modal-header">
              <h3>Confirm Event Registration</h3>
              <button onClick={() => setRsvpEvent(null)}>&times;</button>
            </div>
            {confirmedMessage ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#059669' }}>
                <p style={{ fontWeight: 700, fontSize: '15px' }}>{confirmedMessage}</p>
              </div>
            ) : (
              <div className="skyline-modal-body">
                <p style={{ fontSize: '14px', color: '#101426', marginBottom: '16px' }}>
                  Reserve your admission pass for:
                </p>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#F4F5FB',
                  borderRadius: '8px',
                  border: '1px solid #E2E6F0',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px' }}>
                    {rsvpEvent.title}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#667085' }}>
                    {rsvpEvent.date} • {rsvpEvent.time}
                  </div>
                  <div style={{ fontSize: '13px', color: '#667085' }}>
                    {rsvpEvent.venue}
                  </div>
                </div>
                <div className="skyline-modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setRsvpEvent(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={() => handleRegister(rsvpEvent.id)}
                  >
                    Confirm RSVP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberEvents;
