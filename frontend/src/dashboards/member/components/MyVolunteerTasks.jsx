import React, { useState } from 'react';

/* ── Outline SVG Icons ── */
const IconCheckSquare = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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

export function MyVolunteerTasks({ initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('all');

  React.useEffect(() => {
    setTasks(initialTasks || []);
  }, [initialTasks]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="my-volunteer-tasks-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">
              <IconCheckSquare />
              <span>My Assigned Volunteer Tasks</span>
            </h3>
            <p className="skyline-card-subtitle">
              Operational responsibilities assigned to you by department leads for campus events
            </p>
          </div>
          <span className="skyline-badge badge-active">
            {completedCount} of {tasks.length} Done
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="events-category-filters" style={{ marginBottom: '16px' }}>
          <button
            className={`cat-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            className={`cat-filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Incomplete ({tasks.length - completedCount})
          </button>
          <button
            className={`cat-filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Task Cards List */}
        <div className="volunteer-tasks-container">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`volunteer-task-item-card ${task.isCompleted ? 'is-done' : ''}`}
            >
              <div className="task-checkbox-wrap">
                <input
                  type="checkbox"
                  id={`page-${task.id}`}
                  checked={task.isCompleted}
                  onChange={() => toggleTask(task.id)}
                  className="task-input-checkbox"
                />
              </div>

              <div className="task-body-wrap">
                <div className="task-title-line">
                  <label
                    htmlFor={`page-${task.id}`}
                    className={`task-label-heading ${task.isCompleted ? 'completed-text' : ''}`}
                  >
                    {task.title}
                  </label>
                  <span className={`skyline-badge badge-${task.priority?.toLowerCase() || 'low'}`}>
                    {task.priority || 'Normal'}
                  </span>
                </div>

                {task.notes && (
                  <p className="task-notes-text">{task.notes}</p>
                )}

                <div className="task-footer-meta">
                  <span className="task-dept-pill">{task.department}</span>
                  <span className="task-due-indicator">
                    <IconCalendar /> Due {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#667085' }}>
              No tasks found in this view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyVolunteerTasks;
