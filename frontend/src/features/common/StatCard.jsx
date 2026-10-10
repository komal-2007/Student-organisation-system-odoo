import React from 'react';

/**
 * Reusable presentational StatCard tile.
 * Accepts: title, value, icon, colorTheme ('purple', 'emerald', 'blue', 'amber', 'rose').
 */
export function StatCard({ title, value, icon, colorTheme = 'purple' }) {
  return (
    <div className="skyline-stat-card">
      <div className={`skyline-stat-icon ${colorTheme}`}>{icon}</div>
      <div className="skyline-stat-info">
        <span className="skyline-stat-value">{value}</span>
        <span className="skyline-stat-title">{title}</span>
      </div>
    </div>
  );
}

export default StatCard;
