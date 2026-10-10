import React from 'react';

/**
 * Reusable presentational Card container.
 */
export function Card({ title, subtitle, extra, children, className = '' }) {
  return (
    <div className={`skyline-card ${className}`}>
      {(title || subtitle || extra) && (
        <div className="skyline-card-header">
          <div>
            {title && <h3 className="skyline-card-title">{title}</h3>}
            {subtitle && <p className="skyline-card-subtitle">{subtitle}</p>}
          </div>
          {extra && <div className="skyline-card-extra">{extra}</div>}
        </div>
      )}
      <div className="skyline-card-body">{children}</div>
    </div>
  );
}

export default Card;
