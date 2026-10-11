import React, { useState } from 'react';

/* ── SVG Icons ── */
const Icon = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IconTicket = () => (
  <Icon>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </Icon>
);

const IconCalendar = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

const IconMapPin = () => (
  <Icon>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const IconCheck = () => (
  <Icon size={14}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

const IconBell = () => (
  <Icon>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);

const IconClock = () => (
  <Icon size={14}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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

export function MemberOverview({ data, onNavigate }) {
  const { profile, stats, myTickets, myVolunteerTasks, announcements, discoverEvents } = data;
  const [tasks, setTasks] = useState(myVolunteerTasks || []);

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  return (
    <div className="member-overview-wrapper">
      {/* ── Welcome Banner ── */}
      <div className="member-welcome-banner">
        <div className="welcome-text">
          <div className="welcome-tag">Student Member Portal • Fall 2026</div>
          <h2 className="welcome-title">Welcome back, {profile.name}!</h2>
          <p className="welcome-subtitle">
            You have {myTickets.length} confirmed event passes and {tasks.filter(t => !t.isCompleted).length} assigned tasks requiring attention.
          </p>
        </div>
        <div className="welcome-pass-pill">
          <IconIdBadge />
          <div>
            <div className="pill-id">{profile.digitalPassId}</div>
            <div className="pill-dept">{profile.department}</div>
          </div>
          <span className="pill-status">{profile.membershipStatus}</span>
        </div>
      </div>

      {/* ── Quick KPI Stat Row ── */}
      <div className="member-kpi-grid">
        <div className="member-kpi-card" onClick={() => onNavigate && onNavigate('tickets')}>
          <div className="kpi-icon blue"><IconTicket /></div>
          <div>
            <div className="kpi-value">{stats.activePasses}</div>
            <div className="kpi-label">Active Event Passes</div>
          </div>
        </div>
        <div className="member-kpi-card" onClick={() => onNavigate && onNavigate('membership')}>
          <div className="kpi-icon teal"><IconIdBadge /></div>
          <div>
            <div className="kpi-value">{stats.membershipStatus}</div>
            <div className="kpi-label">Valid Thru {profile.expiresOn.split(',')[0]}</div>
          </div>
        </div>
        <div className="member-kpi-card" onClick={() => onNavigate && onNavigate('reimbursements')}>
          <div className="kpi-icon coral"><IconClock /></div>
          <div>
            <div className="kpi-value">{stats.pendingClaims}</div>
            <div className="kpi-label">Pending Claim Review</div>
          </div>
        </div>
        <div className="member-kpi-card" onClick={() => onNavigate && onNavigate('tasks')}>
          <div className="kpi-icon purple"><IconCheck /></div>
          <div>
            <div className="kpi-value">{tasks.filter(t => !t.isCompleted).length} Tasks</div>
            <div className="kpi-label">Volunteer Assignments</div>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Content ── */}
      <div className="member-overview-grid">
        {/* Left Column: Passes & Available Events */}
        <div className="overview-col">
          {/* Confirmed Passes */}
          <div className="skyline-card">
            <div className="skyline-card-header">
              <div>
                <h3 className="skyline-card-title">
                  <IconTicket />
                  <span>My Confirmed Event Passes</span>
                </h3>
                <p className="skyline-card-subtitle">Active entry passes reserved for upcoming campus events</p>
              </div>
              <button
                className="btn-card-link"
                onClick={() => onNavigate && onNavigate('tickets')}
              >
                View All Passes
              </button>
            </div>

            <div className="member-tickets-list">
              {myTickets.map((tkt) => (
                <div key={tkt.id} className="member-pass-item">
                  <div className="pass-item-main">
                    <div className="pass-item-header">
                      <span className="skyline-badge badge-active">{tkt.status}</span>
                      <span className="pass-category">{tkt.category}</span>
                    </div>
                    <h4 className="pass-title">{tkt.eventTitle}</h4>
                    <div className="pass-meta">
                      <span className="meta-item"><IconCalendar /> {tkt.date} • {tkt.time}</span>
                      <span className="meta-item"><IconMapPin /> {tkt.venue}</span>
                    </div>
                  </div>
                  <div className="pass-qr-box">
                    <div className="pass-qr-visual">
                      <div className="qr-dot" />
                      <div className="qr-dot" />
                      <div className="qr-dot" />
                      <div className="qr-dot" />
                    </div>
                    <code className="qr-code-text">{tkt.ticketCode}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discover Campus Events */}
          <div className="skyline-card">
            <div className="skyline-card-header">
              <div>
                <h3 className="skyline-card-title">
                  <IconCalendar />
                  <span>Upcoming Events to Discover</span>
                </h3>
                <p className="skyline-card-subtitle">Open campus club events available for RSVP</p>
              </div>
              <button
                className="btn-card-link"
                onClick={() => onNavigate && onNavigate('events')}
              >
                Browse All
              </button>
            </div>

            <div className="discover-events-list">
              {discoverEvents.slice(0, 2).map((evt) => (
                <div key={evt.id} className="discover-item">
                  <div className="discover-main">
                    <span className="skyline-badge badge-low">{evt.category}</span>
                    <h4 className="discover-title">{evt.title}</h4>
                    <p className="discover-desc">{evt.description}</p>
                    <div className="discover-meta">
                      <span><IconCalendar /> {evt.date} • {evt.time}</span>
                      <span><IconMapPin /> {evt.venue}</span>
                    </div>
                  </div>
                  <button
                    className="btn-rsvp"
                    onClick={() => onNavigate && onNavigate('events')}
                  >
                    RSVP
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Digital Pass + Tasks + Announcements */}
        <div className="overview-col">
          {/* Digital Membership Pass Card */}
          <div className="skyline-card digital-pass-summary-card">
            <div className="pass-summary-header">
              <div>
                <div className="pass-summary-brand">SKYLINE STUDENT ID</div>
                <div className="pass-summary-tier">{profile.membershipTier}</div>
              </div>
              <span className="skyline-badge badge-approved">Active</span>
            </div>
            <div className="pass-summary-body">
              <div className="pass-avatar-wrap">
                <div className="pass-avatar-initials">{profile.avatarInitials}</div>
              </div>
              <div className="pass-summary-info">
                <h3 className="pass-member-name">{profile.name}</h3>
                <p className="pass-member-email">{profile.email}</p>
                <div className="pass-summary-meta">
                  <div>
                    <span className="meta-label">ID Number</span>
                    <span className="meta-val">{profile.digitalPassId}</span>
                  </div>
                  <div>
                    <span className="meta-label">Department</span>
                    <span className="meta-val">{profile.department}</span>
                  </div>
                  <div>
                    <span className="meta-label">Valid Thru</span>
                    <span className="meta-val">{profile.expiresOn}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Volunteer Tasks */}
          <div className="skyline-card">
            <div className="skyline-card-header">
              <div>
                <h3 className="skyline-card-title">
                  <IconCheck />
                  <span>Assigned Volunteer Tasks</span>
                </h3>
                <p className="skyline-card-subtitle">Your active volunteer responsibilities</p>
              </div>
              <button
                className="btn-card-link"
                onClick={() => onNavigate && onNavigate('tasks')}
              >
                View Checklist
              </button>
            </div>

            <div className="volunteer-tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className="volunteer-task-row">
                  <input
                    type="checkbox"
                    id={`overview-${task.id}`}
                    checked={task.isCompleted}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox"
                  />
                  <label
                    htmlFor={`overview-${task.id}`}
                    className={`task-label ${task.isCompleted ? 'completed' : ''}`}
                  >
                    <span className="task-name">{task.title}</span>
                    <div className="task-sub">
                      <span className="task-dept">{task.department}</span>
                      <span>• Due {task.dueDate}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Feed Preview */}
          <div className="skyline-card">
            <div className="skyline-card-header">
              <div>
                <h3 className="skyline-card-title">
                  <IconBell />
                  <span>Club Announcements</span>
                </h3>
                <p className="skyline-card-subtitle">Latest updates from club leadership</p>
              </div>
              <button
                className="btn-card-link"
                onClick={() => onNavigate && onNavigate('announcements')}
              >
                All News
              </button>
            </div>

            <div className="announcements-preview-list">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="ann-preview-item">
                  <div className="ann-preview-top">
                    <span className="ann-cat-tag">{ann.category}</span>
                    <span className="ann-date-tag">{ann.date}</span>
                  </div>
                  <h4 className="ann-title-text">{ann.title}</h4>
                  <p className="ann-body-snippet">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberOverview;
