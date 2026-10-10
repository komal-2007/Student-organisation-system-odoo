import React from 'react';

/**
 * Reusable presentational status badge component.
 * Accepts: status ('upcoming', 'active', 'pending', 'approved', 'rejected', 'completed', 'draft'), children/label.
 */
export function Badge({ status = 'active', label, children }) {
  const normalizedStatus = status.toLowerCase();
  return (
    <span className={`skyline-badge badge-${normalizedStatus}`}>
      {label || children || status}
    </span>
  );
}

export default Badge;
