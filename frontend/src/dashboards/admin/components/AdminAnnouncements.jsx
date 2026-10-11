import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../services/auth/AuthContext';

/* ==========================================================================
   ADMIN ANNOUNCEMENTS BROADCAST PUBLISHER (MOCK)
   have to Replace local state mutations with API calls:
   - GET  /api/admin/announcements
   - POST /api/admin/announcements
   - PUT  /api/admin/announcements/:id
   - DELETE /api/admin/announcements/:id
   - PUT  /api/admin/announcements/:id/pin
   ========================================================================== */

/* ── Inline SVG Icons ── */
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
  <Icon size={16}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
);
const IconX = () => (
  <Icon size={18}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
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
const IconPin = () => (
  <Icon size={15}>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14l-1.5-6H6.5L5 17z" />
    <path d="M9 11V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v7" />
  </Icon>
);
const IconChevronLeft = () => (
  <Icon size={16}><polyline points="15,18 9,12 15,6" /></Icon>
);

const STATUS_TABS = [
  { id: 'all', label: 'All Updates' },
  { id: 'Published', label: 'Published' },
  { id: 'Draft', label: 'Drafts' },
];

const CATEGORIES = ['General', 'Meeting', 'Finance', 'Technical', 'Governance', 'Event Alert'];
const AUDIENCES = ['All Members', 'Executive Board', 'Tech Department', 'Operations', 'Finance Team', 'Marketing Team'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const INITIAL_FORM = {
  title: '', body: '', category: 'General', audience: 'All Members', priority: 'Medium', status: 'Published', pinned: false
};

const badgeClass = (priority) => {
  if (priority === 'High') return 'skyline-badge badge-high';
  if (priority === 'Medium') return 'skyline-badge badge-medium';
  return 'skyline-badge badge-low';
};

export function AdminAnnouncements({ announcements: initialAnnouncements }) {
  const { user } = useAuth();
  const currentAnnouncements = (initialAnnouncements || []).map((announcement) => {
    const isLegacyPresidentAnnouncement = user?.id === 'demo-admin'
      && announcement.id === 'ann-1'
      && announcement.author === 'Komal Bhatia';
    return announcement.authorId === user?.id || isLegacyPresidentAnnouncement
      ? { ...announcement, author: user.name }
      : announcement;
  });
  const [announcements, setAnnouncements] = useState(currentAnnouncements);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [detailAnn, setDetailAnn] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setAnnouncements(currentAnnouncements);
  }, [initialAnnouncements, user?.id, user?.name]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  /* ── Filtered announcements ── */
  const filtered = useMemo(() => {
    let list = announcements;
    if (activeTab !== 'all') {
      list = list.filter(a => a.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)
      );
    }
    return list;
  }, [announcements, activeTab, search]);

  const counts = useMemo(() => ({
    all: announcements.length,
    Published: announcements.filter(a => a.status === 'Published').length,
    Draft: announcements.filter(a => a.status === 'Draft').length,
  }), [announcements]);

  /* ── Modal & Actions ── */
  const openCreateModal = () => {
    setEditingAnn(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEditModal = (ann) => {
    setEditingAnn(ann);
    setForm({
      title: ann.title,
      body: ann.body,
      category: ann.category,
      audience: ann.audience,
      priority: ann.priority,
      status: ann.status,
      pinned: ann.pinned || false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnn(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;

    if (editingAnn) {
      setAnnouncements(prev => prev.map(a =>
        a.id === editingAnn.id ? { ...a, ...form } : a
      ));
      flash(`Updated announcement "${form.title}" (mock)`);
    } else {
      const newAnn = {
        ...form,
        id: `ann-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        author: user?.name || user?.username || 'Club Admin',
      };
      setAnnouncements(prev => [newAnn, ...prev]);
      flash(`Broadcast published: "${form.title}" (mock)`);
    }
    closeModal();
  };

  const handleTogglePin = (id) => {
    setAnnouncements(prev => prev.map(a =>
      a.id === id ? { ...a, pinned: !a.pinned } : a
    ));
    const target = announcements.find(a => a.id === id);
    flash(`${target?.pinned ? 'Unpinned' : 'Pinned'} broadcast "${target?.title}" (mock)`);
  };

  const handleDelete = (id) => {
    const target = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    flash(`Deleted announcement "${target?.title}" (mock)`);
  };

  return (
    <div className="admin-announcements-section">
      {/* Toast Notification */}
      {successMsg && <div className="admin-events-toast">{successMsg}</div>}

      {/* Toolbar */}
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
              placeholder="Search announcements..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="btn-create-event" onClick={openCreateModal}>
            <IconPlus /> Compose Broadcast
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="skyline-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="admin-events-empty">
            <IconSearch />
            <p className="admin-events-empty-title">No announcements found</p>
            <p className="admin-events-empty-sub">No broadcast messages match your search or filter parameters.</p>
          </div>
        ) : (
          <div className="skyline-table-wrapper">
            <table className="skyline-table">
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Audience</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ann => (
                  <tr key={ann.id} style={ann.pinned ? { background: '#FAF9FE' } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {ann.pinned && <span title="Pinned Announcement" style={{ color: '#7257E8' }}><IconPin /></span>}
                        <strong className="admin-events-title-cell">{ann.title}</strong>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12.5, color: '#667085' }}>{ann.audience}</span></td>
                    <td><span className="admin-events-category-chip">{ann.category}</span></td>
                    <td><span className={badgeClass(ann.priority)}>{ann.priority}</span></td>
                    <td style={{ fontSize: 13 }}>{ann.author}</td>
                    <td className="admin-events-date-cell">{ann.date}</td>
                    <td>
                      <span className={`skyline-badge ${ann.status === 'Published' ? 'badge-approved' : 'badge-pending'}`}>
                        {ann.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-table" title="Preview broadcast" onClick={() => setDetailAnn(ann)}>
                          <IconEye />
                        </button>
                        <button
                          className="btn-table"
                          title={ann.pinned ? 'Unpin broadcast' : 'Pin to top'}
                          style={ann.pinned ? { background: '#F0EDFC', color: '#7257E8', borderColor: '#7257E8' } : {}}
                          onClick={() => handleTogglePin(ann.id)}
                        >
                          <IconPin />
                        </button>
                        <button className="btn-table" title="Edit announcement" onClick={() => openEditModal(ann)}>
                          <IconEdit />
                        </button>
                        <button className="btn-table" title="Delete broadcast" style={{ color: '#EF4444' }} onClick={() => setDeleteConfirm(ann.id)}>
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compose / Edit Modal */}
      {showModal && (
        <div className="admin-events-overlay" onClick={closeModal}>
          <div className="admin-events-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">
                {editingAnn ? 'Edit Broadcast' : 'Compose Announcement'}
              </h3>
              <button className="admin-events-modal-close" onClick={closeModal}><IconX /></button>
            </div>

            <form onSubmit={handleSubmit} className="admin-events-form">
              <div className="form-field">
                <label>Headline Title <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. General Body Meeting Reminder"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Target Audience</label>
                  <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                    {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Priority Level</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Published">Publish Immediately</option>
                    <option value="Draft">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Broadcast Message <span className="req">*</span></label>
                <textarea
                  rows="4"
                  placeholder="Write message content for members..."
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={form.pinned}
                  onChange={e => setForm({ ...form, pinned: e.target.checked })}
                />
                <label htmlFor="pinCheck" style={{ fontSize: 13, color: '#101426', cursor: 'pointer' }}>
                  Pin this announcement to top of member feeds
                </label>
              </div>

              <div className="admin-events-modal-actions">
                <button type="button" className="btn-table" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-create-event">
                  {editingAnn ? 'Save Changes' : 'Broadcast Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Drawer */}
      {detailAnn && (
        <div className="admin-events-overlay" onClick={() => setDetailAnn(null)}>
          <div className="admin-events-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-events-drawer-header">
              <button className="admin-events-drawer-back" onClick={() => setDetailAnn(null)}>
                <IconChevronLeft /> Back to List
              </button>
              <span className={badgeClass(detailAnn.priority)}>{detailAnn.priority} Priority</span>
            </div>

            <h3 className="admin-events-drawer-title">{detailAnn.title}</h3>
            <div style={{ display: 'flex', gap: 8, margin: '8px 0 16px', flexWrap: 'wrap' }}>
              <span className="admin-events-category-chip">{detailAnn.category}</span>
              <span style={{ fontSize: 12, color: '#667085', background: '#F4F5FB', padding: '2px 8px', borderRadius: 4 }}>
                Audience: {detailAnn.audience}
              </span>
            </div>

            <p className="admin-events-drawer-meta">
              Published by {detailAnn.author} on {detailAnn.date}
            </p>

            <div className="admin-events-drawer-desc">
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{detailAnn.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="admin-events-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-events-modal admin-events-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="admin-events-modal-title" style={{ color: '#DC2626' }}>Confirm Deletion</h3>
            <p style={{ fontSize: 14, color: '#667085', margin: '8px 0 20px' }}>
              Are you sure you want to delete this broadcast update? It will be removed from member feeds (mock).
            </p>
            <div className="admin-events-modal-actions">
              <button className="btn-table" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-table reject" onClick={() => handleDelete(deleteConfirm)}>Delete Announcement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnnouncements;
