import React, { useState, useMemo } from 'react';

/* ==========================================================================
   ADMIN MEMBERS DIRECTORY — Full Management Screen (MOCK)
   Person 2: Replace local state mutations with API calls:
   - GET  /api/admin/members
   - PUT  /api/admin/members/:id/status (Approve / Reject / Deactivate)
   - PUT  /api/admin/members/:id/role
   - DELETE /api/admin/members/:id
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
const IconCheck = () => (
  <Icon size={15}><polyline points="20,6 9,17 4,12" /></Icon>
);
const IconBan = () => (
  <Icon size={15}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </Icon>
);
const IconChevronLeft = () => (
  <Icon size={16}><polyline points="15,18 9,12 15,6" /></Icon>
);
const IconFilter = () => (
  <Icon size={15}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Icon>
);
const IconTrash = () => (
  <Icon size={15}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </Icon>
);

/* ── Filter Tabs ── */
const STATUS_TABS = [
  { id: 'all', label: 'All Members' },
  { id: 'Active', label: 'Active' },
  { id: 'Pending Approval', label: 'Pending' },
  { id: 'Inactive', label: 'Inactive' },
];

const DEPARTMENTS = ['All', 'Executive', 'Operations', 'Finance', 'Tech', 'Marketing', 'Logistics', 'Events'];
const ROLES = ['Member', 'Vice President', 'Treasurer', 'Marketing Lead', 'Tech Lead', 'Operations Lead', 'President / Admin'];

const badgeClass = (status) => {
  if (status === 'Active') return 'skyline-badge badge-approved';
  if (status === 'Pending Approval') return 'skyline-badge badge-pending';
  return 'skyline-badge badge-rejected';
};

export function AdminMembers({ members: initialMembers }) {
  const [members, setMembers] = useState(initialMembers || []);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDept, setSelectedDept] = useState('All');
  
  const [detailMember, setDetailMember] = useState(null);
  const [editRoleMember, setEditRoleMember] = useState(null);
  const [removeConfirmMember, setRemoveConfirmMember] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    let list = members;
    if (activeTab !== 'all') {
      list = list.filter(m => m.status === activeTab);
    }
    if (selectedDept !== 'All') {
      list = list.filter(m => m.department === selectedDept);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.studentId && m.studentId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [members, activeTab, selectedDept, search]);

  const counts = useMemo(() => ({
    all: members.length,
    Active: members.filter(m => m.status === 'Active').length,
    'Pending Approval': members.filter(m => m.status === 'Pending Approval').length,
    Inactive: members.filter(m => m.status === 'Inactive').length,
  }), [members]);

  /* ── Actions ── */
  const handleApprove = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'Active' } : m));
    const target = members.find(m => m.id === id);
    flash(`Approved registration for ${target?.name} (mock)`);
  };

  const handleReject = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'Inactive' } : m));
    const target = members.find(m => m.id === id);
    flash(`Rejected membership for ${target?.name} (mock)`);
  };

  const handleRemoveMember = () => {
    if (!removeConfirmMember) return;
    setMembers(prev => prev.filter(m => m.id !== removeConfirmMember.id));
    flash(`Removed member ${removeConfirmMember.name} (mock)`);
    setRemoveConfirmMember(null);
  };

  const openEditRoleModal = (m) => {
    if (m.role.includes('President') || m.id === 'mem-1') {
      flash('President / Admin role cannot be modified.');
      return;
    }
    setEditRoleMember(m);
    setNewRole(m.role);
    setNewDept(m.department);
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!editRoleMember) return;
    setMembers(prev => prev.map(m =>
      m.id === editRoleMember.id ? { ...m, role: newRole, department: newDept } : m
    ));
    flash(`Updated role and department for ${editRoleMember.name} (mock)`);
    setEditRoleMember(null);
  };

  return (
    <div className="admin-members-section">
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
          {/* Department Filter Dropdown */}
          <div className="admin-events-search" style={{ minWidth: 160 }}>
            <IconFilter />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', cursor: 'pointer' }}
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="admin-events-search">
            <IconSearch />
            <input
              type="text"
              placeholder="Search members, email, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Members Directory Card */}
      <div className="skyline-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="admin-events-empty">
            <IconSearch />
            <p className="admin-events-empty-title">No members found</p>
            <p className="admin-events-empty-sub">Try broadening your search or filter parameters.</p>
          </div>
        ) : (
          <div className="skyline-table-wrapper">
            <table className="skyline-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(mem => (
                  <tr key={mem.id}>
                    <td>
                      <strong className="admin-events-title-cell">{mem.name}</strong>
                      <div className="admin-events-organizer">{mem.email}</div>
                    </td>
                    <td><span style={{ fontSize: 12.5, color: '#667085', fontFamily: 'monospace' }}>{mem.studentId || 'N/A'}</span></td>
                    <td><span className="admin-events-category-chip">{mem.department}</span></td>
                    <td><strong>{mem.role}</strong></td>
                    <td className="admin-events-date-cell">{mem.joinedDate}</td>
                    <td><span className={badgeClass(mem.status)}>{mem.status}</span></td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-table" title="View details" onClick={() => setDetailMember(mem)}>
                          <IconEye />
                        </button>
                        
                        {mem.status === 'Pending Approval' ? (
                          <>
                            <button className="btn-table approve" title="Approve member" onClick={() => handleApprove(mem.id)}>
                              Approve
                            </button>
                            <button className="btn-table reject" title="Reject registration" onClick={() => handleReject(mem.id)}>
                              Reject
                            </button>
                          </>
                        ) : mem.role.includes('President') ? (
                          <button
                            className="btn-table"
                            disabled
                            style={{ opacity: 0.5, cursor: 'not-allowed', background: '#F4F5FB', color: '#667085' }}
                            title="President / Admin role cannot be modified"
                          >
                            Protected
                          </button>
                        ) : (
                          <>
                            <button className="btn-table" title="Edit Role & Dept" onClick={() => openEditRoleModal(mem)}>
                              <IconEdit />
                            </button>
                            <button className="btn-table" title="Remove Member" onClick={() => setRemoveConfirmMember(mem)} style={{ color: '#D92D20' }}>
                              <IconTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editRoleMember && (
        <div className="admin-events-overlay" onClick={() => setEditRoleMember(null)}>
          <div className="admin-events-modal admin-events-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Edit Role & Department</h3>
              <button className="admin-events-modal-close" onClick={() => setEditRoleMember(null)}><IconX /></button>
            </div>
            
            <form onSubmit={handleSaveRole} className="admin-events-form">
              <div style={{ fontSize: 13.5, color: '#667085', marginBottom: 6 }}>
                Updating permissions for <strong>{editRoleMember.name}</strong>
              </div>

              <div className="form-field">
                <label>Organization Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label>Department</label>
                <select value={newDept} onChange={e => setNewDept(e.target.value)}>
                  {DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="admin-events-modal-actions">
                <button type="button" className="btn-table" onClick={() => setEditRoleMember(null)}>Cancel</button>
                <button type="submit" className="btn-create-event">Save Permissions</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Detail Drawer */}
      {detailMember && (
        <div className="admin-events-overlay" onClick={() => setDetailMember(null)}>
          <div className="admin-events-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-events-drawer-header">
              <button className="admin-events-drawer-back" onClick={() => setDetailMember(null)}>
                <IconChevronLeft /> Back to Directory
              </button>
              <span className={badgeClass(detailMember.status)}>{detailMember.status}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7257E8, #4D9CFF)',
                color: '#fff', fontSize: 18, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {detailMember.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="admin-events-drawer-title">{detailMember.name}</h3>
                <span className="admin-events-category-chip">{detailMember.department} • {detailMember.role}</span>
              </div>
            </div>

            <div className="admin-events-drawer-desc">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: 13 }}>
                <div><strong>Email:</strong> {detailMember.email}</div>
                <div><strong>Phone:</strong> {detailMember.phone || 'N/A'}</div>
                <div><strong>Student ID:</strong> {detailMember.studentId || 'N/A'}</div>
                <div><strong>Joined Date:</strong> {detailMember.joinedDate}</div>
              </div>
            </div>

            {detailMember.notes && (
              <div style={{ marginBottom: 20 }}>
                <h4 className="admin-events-drawer-section-title">Registration Notes</h4>
                <p style={{ fontSize: 13, color: '#101426', background: '#F4F5FB', padding: 12, borderRadius: 8, margin: 0 }}>
                  {detailMember.notes}
                </p>
              </div>
            )}

            {detailMember.status === 'Pending Approval' && (
              <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                <button className="btn-table approve" style={{ flex: 1, padding: 10 }} onClick={() => { handleApprove(detailMember.id); setDetailMember(null); }}>
                  Approve Registration
                </button>
                <button className="btn-table reject" style={{ flex: 1, padding: 10 }} onClick={() => { handleReject(detailMember.id); setDetailMember(null); }}>
                  Reject Registration
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Remove Confirm Modal */}
      {removeConfirmMember && (
        <div className="admin-events-overlay" onClick={() => setRemoveConfirmMember(null)}>
          <div className="admin-events-modal admin-events-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Remove Member</h3>
              <button className="admin-events-modal-close" onClick={() => setRemoveConfirmMember(null)}><IconX /></button>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <p style={{ margin: 0, fontSize: 13.5, color: '#101426', lineHeight: 1.5 }}>
                Are you sure you want to remove <strong>{removeConfirmMember.name}</strong> from the organization? This action cannot be undone.
              </p>
              <div className="admin-events-modal-actions" style={{ marginTop: 24 }}>
                <button className="btn-table" onClick={() => setRemoveConfirmMember(null)}>Cancel</button>
                <button className="btn-create-event" style={{ background: '#D92D20', color: '#fff' }} onClick={handleRemoveMember}>
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMembers;
