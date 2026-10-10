import React, { useState } from 'react';

export function MyVolunteerTasks({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  return (
    <div className="my-volunteer-tasks-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">My Assigned Volunteer Tasks</h3>
          <p className="skyline-card-subtitle">Tasks assigned to you for upcoming club operations</p>
        </div>
        <div className="skyline-card-body">
          <div className="tasks-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-checkbox-item">
                <input
                  type="checkbox"
                  id={task.id}
                  checked={task.isCompleted}
                  onChange={() => toggleTask(task.id)}
                />
                <label htmlFor={task.id} className={task.isCompleted ? 'completed-text' : ''}>
                  <strong>{task.title}</strong>
                  <span className="task-due">Due: {task.dueDate}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyVolunteerTasks;
