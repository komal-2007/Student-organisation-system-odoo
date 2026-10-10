import React, { useState, useMemo } from 'react';

/* ==========================================================================
   ADMIN EVENTS & TICKETS — Full Management Screen (MOCK)
   Person 2: Replace local state mutations with API calls:
   - GET  /api/admin/events
   - POST /api/admin/events
   - PUT  /api/admin/events/:id
   - DELETE /api/admin/events/:id
   - GET  /api/admin/events/:id/attendees
   ========================================================================== */

/* ── Inline SVG Icons (outline, no emoji) ── */
const Icon = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconSearch = () => (
  <Icon size={16}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);
const IconPlus = () => (
  <Icon size={16}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);
const IconX = () => (
  <Icon size={18}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);
const IconEye = () => (
  <Icon size={15}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
const IconEdit = () => (
  <Icon size={15}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Icon>
);
const IconTrash = () => (
  <Icon size={15}>
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </Icon>
);
const IconChevronLeft = () => (
  <Icon size={16}><polyline points="15,18 9,12 15,6" /></Icon>
);

/* ── Status filter tabs ── */
const STATUS_TABS = [
  { id: 'all', label: 'All Events' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'draft', label: 'Draft' },
];

/* ── Category options for create/edit form ── */
const CATEGORY_OPTIONS = ['Hackathon', 'Workshop', 'Social', 'Ceremony', 'Competition', 'Meeting', 'Other'];

const INITIAL_FORM = {
  title: '', date: '', time: '', venue: '', category: 'Workshop',
  capacity: '', ticketPrice: 'Free', description: '', status: 'draft',
};

/* ── Helpers ── */
const badgeClass = (status) => {
  const map = {
    upcoming: 'badge-approved',
    past: 'badge-low',
    draft: 'badge-pending',
  };
  return `skyline-badge ${map[status] || 'badge-pending'}`;
};

const capacityPercent = (reg, cap) => cap ? Math.round((reg / cap) * 100) : 0;

const capacityColor = (pct) => {
  if (pct >= 90) return '#FF8B82';
  if (pct >= 70) return '#F59E0B';
  return '#45D6C5';
};

export function AdminEvents({ events: initialEvents, eventAttendees }) {
  /* ── State ── */
  const [events, setEvents] = useState(initialEvents || []);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);   // null = create, object = edit
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [detailEvent, setDetailEvent] = useState(null);     // attendee drawer
  const [deleteConfirm, setDeleteConfirm] = useState(null); // event id pending delete
  const [successMsg, setSuccessMsg] = useState('');

  /* ── Filtered / searched list ── */
  const filtered = useMemo(() => {
    let list = events;
    if (activeTab !== 'all') list = list.filter(e => e.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.date.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, activeTab, search]);

  /* ── Counts per tab ── */
  const counts = useMemo(() => ({
    all: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    past: events.filter(e => e.status === 'past').length,
    draft: events.filter(e => e.status === 'draft').length,
  }), [events]);

  /* ── Form helpers ── */
  const openCreateModal = () => {
    setEditingEvent(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setShowCreateModal(true);
  };

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setForm({
      title: evt.title,
      date: evt.date,
      time: evt.time,
      venue: evt.venue,
      category: evt.category,
      capacity: String(evt.capacity),
      ticketPrice: evt.ticketPrice,
      description: evt.description,
      status: evt.status,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
  };

  const validate = () => {
    const errs = {};
    const todayStr = new Date().toISOString().split('T')[0];
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.date) {
      errs.date = 'Date is required';
    } else if (form.date < todayStr) {
      errs.date = 'Event date cannot be in the past';
    }
    if (!form.time) errs.time = 'Time is required';
    if (!form.venue.trim()) errs.venue = 'Venue is required';
    if (!form.capacity || isNaN(form.capacity) || Number(form.capacity) < 1)
      errs.capacity = 'Valid capacity required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingEvent) {
      /* ── MOCK UPDATE ── */
      setEvents(prev => prev.map(ev =>
        ev.id === editingEvent.id
          ? { ...ev, ...form, capacity: Number(form.capacity) }
          : ev
      ));
      flash(`"${form.title}" updated successfully (mock)`);
    } else {
      /* ── MOCK CREATE ── */
      const newEvt = {
        ...form,
        id: `evt-${Date.now()}`,
        capacity: Number(form.capacity),
        registered: 0,
        organizer: 'Komal Bhatia',
      };
      setEvents(prev => [newEvt, ...prev]);
      flash(`"${form.title}" created successfully (mock)`);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const evt = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeleteConfirm(null);
    flash(`"${evt?.title}" deleted (mock)`);
  };

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  /* ── Attendee drawer data ── */
  const attendees = detailEvent && eventAttendees?.[detailEvent.id]
    ? eventAttendees[detailEvent.id]
    : [];

  /* ======================================================================== */
  return (
    <div className="admin-events-section">

      {/* ── Success Toast ── */}
      {successMsg && (
        <div className="admin-events-toast">{successMsg}</div>
      )}

      {/* ── Toolbar: Filter tabs + Search + Create ── */}
      <div className="admin-events-toolbar">
        <div className="admin-events-tabs">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-events-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tab-count">{counts[tab.id]}</span>
            </button>
          ))}
        </div>
        <div className="admin-events-toolbar-right">
          <div className="admin-events-search">
            <IconSearch />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-create-event" onClick={openCreateModal}>
            <IconPlus /> Create Event
          </button>
        </div>
      </div>

      {/* ── Events Table ── */}
      <div className="skyline-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="admin-events-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="#A7B0CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="admin-events-empty-title">No events found</p>
            <p className="admin-events-empty-sub">
              {search ? 'Try a different search term.' : 'Create your first event to get started.'}
            </p>
          </div>
        ) : (
          <div className="skyline-table-wrapper">
            <table className="skyline-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Category</th>
                  <th>Capacity</th>
                  <th>Ticket</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(evt => {
                  const pct = capacityPercent(evt.registered, evt.capacity);
                  return (
                    <tr key={evt.id}>
                      <td>
                        <strong className="admin-events-title-cell">{evt.title}</strong>
                        <div className="admin-events-organizer">by {evt.organizer}</div>
                      </td>
                      <td className="admin-events-date-cell">
                        <span>{evt.date}</span>
                        <span className="admin-events-time">{evt.time}</span>
                      </td>
                      <td>{evt.venue}</td>
                      <td><span className="admin-events-category-chip">{evt.category}</span></td>
                      <td>
                        <div className="admin-events-capacity">
                          <span className="admin-events-capacity-text">{evt.registered}/{evt.capacity}</span>
                          <div className="admin-events-capacity-bar">
                            <div
                              className="admin-events-capacity-fill"
                              style={{ width: `${Math.min(pct, 100)}%`, background: capacityColor(pct) }}
                            />
                          </div>
                          <span className="admin-events-capacity-pct">{pct}%</span>
                        </div>
                      </td>
                      <td>{evt.ticketPrice}</td>
                      <td><span className={badgeClass(evt.status)}>{evt.status}</span></td>
                      <td>
                        <div className="table-actions" style={{ gap: '4px', display: 'flex' }}>
                          <button className="btn-table" title="View attendees" onClick={() => setDetailEvent(evt)}>
                            <IconEye />
                          </button>
                          <button className="btn-table" title="Edit event" onClick={() => openEditModal(evt)}>
                            <IconEdit />
                          </button>
                          <button className="btn-table" title="Delete event" onClick={() => setDeleteConfirm(evt.id)}
                            style={{ color: '#EF4444' }}>
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ── */}
      {deleteConfirm && (
        <div className="admin-events-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-events-modal admin-events-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="admin-events-modal-title" style={{ color: '#DC2626' }}>Confirm Deletion</h3>
            <p style={{ fontSize: 14, color: '#667085', margin: '8px 0 20px' }}>
              This will permanently remove the event. This action is mocked and cannot be undone.
            </p>
            <div className="admin-events-modal-actions">
              <button className="btn-table" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-table reject" onClick={() => handleDelete(deleteConfirm)}>Delete Event</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showCreateModal && (
        <div className="admin-events-overlay" onClick={closeModal}>
          <div className="admin-events-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button className="admin-events-modal-close" onClick={closeModal}><IconX /></button>
            </div>

            <form onSubmit={handleSubmit} className="admin-events-form">
              {/* Title */}
              <div className="form-field">
                <label>Event Title <span className="req">*</span></label>
                <input type="text" value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="e.g. Spring Hackathon 2026" />
                {formErrors.title && <span className="form-error">{formErrors.title}</span>}
              </div>

              {/* Date + Time row */}
              <div className="form-row">
                <div className="form-field">
                  <label>Date <span className="req">*</span></label>
                  <input type="date" value={form.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => handleChange('date', e.target.value)} />
                  {formErrors.date && <span className="form-error">{formErrors.date}</span>}
                </div>
                <div className="form-field">
                  <label>Time <span className="req">*</span></label>
                  <input type="time" value={form.time}
                    onChange={e => handleChange('time', e.target.value)} />
                  {formErrors.time && <span className="form-error">{formErrors.time}</span>}
                </div>
              </div>

              {/* Venue */}
              <div className="form-field">
                <label>Venue <span className="req">*</span></label>
                <input type="text" value={form.venue}
                  onChange={e => handleChange('venue', e.target.value)}
                  placeholder="e.g. Engineering Hall B" />
                {formErrors.venue && <span className="form-error">{formErrors.venue}</span>}
              </div>

              {/* Category + Capacity row */}
              <div className="form-row">
                <div className="form-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => handleChange('category', e.target.value)}>
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Capacity <span className="req">*</span></label>
                  <input type="number" min="1" value={form.capacity}
                    onChange={e => handleChange('capacity', e.target.value)}
                    placeholder="e.g. 100" />
                  {formErrors.capacity && <span className="form-error">{formErrors.capacity}</span>}
                </div>
              </div>

              {/* Ticket Price + Status row */}
              <div className="form-row">
                <div className="form-field">
                  <label>Ticket Price</label>
                  <input type="text" value={form.ticketPrice}
                    onChange={e => handleChange('ticketPrice', e.target.value)}
                    placeholder="Free or $10.00" />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming (Published)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-field">
                <label>Description</label>
                <textarea rows="3" value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Brief description of the event..." />
              </div>

              <div className="admin-events-modal-actions">
                <button type="button" className="btn-table" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-create-event">
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Attendee Detail Drawer ── */}
      {detailEvent && (
        <div className="admin-events-overlay" onClick={() => setDetailEvent(null)}>
          <div className="admin-events-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-events-drawer-header">
              <button className="admin-events-drawer-back" onClick={() => setDetailEvent(null)}>
                <IconChevronLeft /> Back
              </button>
              <span className={badgeClass(detailEvent.status)}>{detailEvent.status}</span>
            </div>

            <h3 className="admin-events-drawer-title">{detailEvent.title}</h3>
            <p className="admin-events-drawer-meta">
              {detailEvent.date} • {detailEvent.time} • {detailEvent.venue}
            </p>
            {detailEvent.description && (
              <p className="admin-events-drawer-desc">{detailEvent.description}</p>
            )}

            {/* Capacity summary */}
            <div className="admin-events-drawer-capacity">
              <div className="admin-events-capacity-bar" style={{ height: 8 }}>
                <div
                  className="admin-events-capacity-fill"
                  style={{
                    width: `${Math.min(capacityPercent(detailEvent.registered, detailEvent.capacity), 100)}%`,
                    background: capacityColor(capacityPercent(detailEvent.registered, detailEvent.capacity)),
                  }}
                />
              </div>
              <span style={{ fontSize: 13, color: '#667085' }}>
                {detailEvent.registered} / {detailEvent.capacity} registered
                ({capacityPercent(detailEvent.registered, detailEvent.capacity)}%)
              </span>
            </div>

            {/* Attendee list */}
            <h4 className="admin-events-drawer-section-title">Registered Attendees</h4>
            {attendees.length === 0 ? (
              <p style={{ fontSize: 13, color: '#A7B0CC', padding: '12px 0' }}>
                No attendee data available for this event (mock).
              </p>
            ) : (
              <table className="skyline-table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Registered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map(att => (
                    <tr key={att.id}>
                      <td>
                        <strong>{att.name}</strong>
                        <div style={{ fontSize: 11.5, color: '#667085' }}>{att.email}</div>
                      </td>
                      <td>{att.department}</td>
                      <td>{att.registeredOn}</td>
                      <td>
                        <span className={`skyline-badge ${att.status === 'confirmed' ? 'badge-approved' : 'badge-pending'}`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEvents;
