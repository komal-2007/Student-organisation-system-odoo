import React from 'react';

/**
 * Reusable modal wrapper component.
 * Accepts: isOpen, onClose, title, children, footer.
 */
export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="skyline-modal-overlay" onClick={onClose}>
      <div className="skyline-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="skyline-modal-header">
          <h3 className="skyline-modal-title">{title}</h3>
          <button className="skyline-modal-close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="skyline-modal-body">{children}</div>
        {footer && <div className="skyline-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
