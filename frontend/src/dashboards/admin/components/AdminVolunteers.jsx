import React from 'react';

export function AdminVolunteers({ tasks }) {
  return (
    <div className="admin-volunteers-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Volunteer Operations & Task Assignments</h3>
          <p className="skyline-card-subtitle">Assign operational tasks to departments and track completion</p>
        </div>
        <div className="skyline-card-body">
          <table className="skyline-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Department</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td><strong>{task.title}</strong></td>
                  <td>{task.department}</td>
                  <td>{task.assignee}</td>
                  <td>{task.dueDate}</td>
                  <td><span className="skyline-badge badge-pending">{task.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminVolunteers;
