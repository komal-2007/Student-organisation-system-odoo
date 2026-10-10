import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

/**
 * RealQRCode
 * Generates an authentic, scannable QR Code image directly from a genuine ticket token.
 * If the ticket is invalid, unissued, or cancelled, it renders an honest notice without dummy graphics.
 */
export function RealQRCode({ token, size = 120, label, status = 'VALID' }) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token || status === 'CANCELLED') {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(token, {
      width: size,
      margin: 1,
      color: {
        dark: '#101426',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [token, size, status]);

  if (!token || status === 'CANCELLED' || error) {
    return (
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#F4F5FB',
          border: '1px solid #E2E6F0',
          borderRadius: '8px',
          color: '#667085',
          fontSize: '12px',
          textAlign: 'center',
          maxWidth: `${size + 40}px`,
          margin: '0 auto',
        }}
      >
        QR code unavailable until a valid ticket is issued.
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#F4F5FB',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          color: '#667085',
          margin: '0 auto',
        }}
      >
        Generating QR...
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <img
        src={dataUrl}
        alt={`Genuine Ticket QR Code: ${token}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '6px',
          border: '1px solid #E2E6F0',
          backgroundColor: '#ffffff',
          padding: '4px',
        }}
      />
      {label && (
        <span
          style={{
            marginTop: '6px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: '#667085',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export default RealQRCode;
