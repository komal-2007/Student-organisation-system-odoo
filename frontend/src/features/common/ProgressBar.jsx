import React from 'react';

/**
 * Reusable presentational progress bar component.
 * Accepts: value, max, label, isFullWarning.
 */
export function ProgressBar({ value = 0, max = 100, label, isFullWarning = false }) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  
  return (
    <div className="skyline-progress-container">
      {label && (
        <div className="skyline-progress-label-row">
          <span>{label}</span>
          <span className="skyline-progress-value">{value} / {max} ({percentage}%)</span>
        </div>
      )}
      <div className="skyline-progress-track">
        <div 
          className={`skyline-progress-fill ${isFullWarning && percentage >= 100 ? 'warning' : ''}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
