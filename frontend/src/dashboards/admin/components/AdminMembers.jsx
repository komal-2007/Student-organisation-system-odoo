import React from 'react';

export function AdminMembers({ members }) {
  return (
    <div className="admin-members-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Club Membership Directory & Permissions</h3>
          <p className="skyline-card-subtitle">Manage member roles, department assignments, and pending registrations</p>
        </div>
        <div className="skyline-card-body">
          <table className="skyline-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((mem) => (
                <tr key={mem.id}>
                  <td><strong>{mem.name}</strong></td>
                  <td>{mem.email}</td>
                  <td>{mem.role}</td>
                  <td>{mem.department}</td>
                  <td><span className={`skyline-badge ${mem.status === 'Active' ? 'badge-approved' : 'badge-pending'}`}>{mem.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminMembers;
