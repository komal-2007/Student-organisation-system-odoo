import React, { useState, useMemo } from 'react';

/* ==========================================================================
   ADMIN VOLUNTEER OPERATIONS & TASKS (MOCK)
   Person 2: Replace local state mutations with API calls:
   - GET  /api/admin/volunteers/tasks
   - POST /api/admin/volunteers/tasks
   - PUT  /api/admin/volunteers/tasks/:id
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

const STATUS_TABS = [
  { id: 'all', label: 'All Tasks' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Pending', label: 'Pending' },
  { id: 'Completed', label: 'Completed' },
];

const DEPARTMENTS = ['Logistics', 'Marketing', 'Catering', 'Tech', 'Finance', 'Events'];
const ASSIGNEES = ['Sarah Jenkins', 'Elena Rostova', 'David Chen', 'Alex Rivera', 'Marcus Vance', 'Priya Nair'];

const badgeClass = (status) => {
  if (status === 'Completed') return 'skyline-badge badge-approved';
  if (status === 'In Progress') return 'skyline-badge badge-low';
  return 'skyline-badge badge-pending';
};

const INITIAL_FORM = {
  title: '', department: 'Logistics', assignee: 'Sarah Jenkins', priority: 'Medium', dueDate: '', notes: ''
};

export function AdminVolunteers({ tasks: initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [detailTask, setDetailTask] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const filtered = useMemo(() => {
    let list = tasks;
    if (activeTab !== 'all') {
      list = list.filter(t => t.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tasks, activeTab, search]);

  const counts = useMemo(() => ({
    all: tasks.length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Pending: tasks.filter(t => t.status === 'Pending').length,
    Completed: tasks.filter(t => t.status === 'Completed').length,
  }), [tasks]);

  const handleStatusChange = (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const target = tasks.find(t => t.id === id);
    flash(`Updated task status to "${newStatus}" (mock)`);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const newTask = {
      ...form,
      id: `tsk-${Date.now()}`,
      status: 'Pending',
    };

    setTasks(prev => [newTask, ...prev]);
    flash(`Assigned new task to ${form.assignee} (mock)`);
    setShowModal(false);
    setForm(INITIAL_FORM);
  };

  return (
    <div className="admin-volunteers-section">
      {/* Toast */}
      {successMsg && <div className="admin-events-toast">{successMsg}</div>}

      {/* Summary Pills */}
      <div className="finance-summary-pills">
        <div className="pill-stat income" style={{ background: '#E8F2FF', color: '#4D9CFF' }}>
          Active Operations: {counts['In Progress']}
        </div>
        <div className="pill-stat balance">Pending Assignments: {counts.Pending}</div>
        <div className="pill-stat income">Completed Tasks: {counts.Completed}</div>
      </div>

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
              placeholder="Search task, volunteer, dept..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="btn-create-event" onClick={() => setShowModal(true)}>
            <IconPlus /> Assign Task
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="skyline-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="admin-events-empty">
            <IconSearch />
            <p className="admin-events-empty-title">No volunteer tasks found</p>
          </div>
        ) : (
          <div className="skyline-table-wrapper">
            <table className="skyline-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Department</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(task => (
                  <tr key={task.id}>
                    <td><strong className="admin-events-title-cell">{task.title}</strong></td>
                    <td><span className="admin-events-category-chip">{task.department}</span></td>
                    <td style={{ fontSize: 13 }}>{task.assignee}</td>
                    <td className="admin-events-date-cell">{task.dueDate || 'N/A'}</td>
                    <td>
                      <span className={`skyline-badge ${task.priority === 'High' ? 'badge-high' : 'badge-low'}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        style={{ padding: '3px 8px', borderRadius: 6, fontSize: 12, border: '1px solid #E2E6F0', background: '#fff', cursor: 'pointer' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn-table" title="View details" onClick={() => setDetailTask(task)}>
                        <IconEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="admin-events-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-events-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Assign Volunteer Task</h3>
              <button className="admin-events-modal-close" onClick={() => setShowModal(false)}><IconX /></button>
            </div>

            <form onSubmit={handleCreateTask} className="admin-events-form">
              <div className="form-field">
                <label>Task Title <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Manage Registration QR Scanner"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Assignee Volunteer</label>
                  <select value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })}>
                    {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Task Instructions / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Provide instructions for the assignee..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="admin-events-modal-actions">
                <button type="button" className="btn-table" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-create-event">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {detailTask && (
        <div className="admin-events-overlay" onClick={() => setDetailTask(null)}>
          <div className="admin-events-modal admin-events-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Task Details</h3>
              <button className="admin-events-modal-close" onClick={() => setDetailTask(null)}><IconX /></button>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{detailTask.title}</h4>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <span className="admin-events-category-chip">{detailTask.department}</span>
              <span className={badgeClass(detailTask.status)}>{detailTask.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, marginBottom: 14 }}>
              <div><strong>Assignee:</strong> {detailTask.assignee}</div>
              <div><strong>Due Date:</strong> {detailTask.dueDate || 'N/A'}</div>
            </div>

            {detailTask.notes && (
              <div className="admin-events-drawer-desc">
                <strong>Instructions:</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#101426' }}>{detailTask.notes}</p>
              </div>
            )}

            <div className="admin-events-modal-actions">
              <button className="btn-table" onClick={() => setDetailTask(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVolunteers;
