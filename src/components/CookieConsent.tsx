import React, { useState, useEffect } from 'react';

const CONSENT_KEY = 'md_cookie_consent';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: '#fff',
      borderTop: '1px solid var(--border-light)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      <p style={{
        margin: 0,
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        flex: 1,
        minWidth: '250px'
      }}>
        We use cookies to enhance your shopping experience and analyse site traffic.
        By clicking "Accept", you consent to our use of cookies.
        <a href="/faq" style={{ color: 'var(--gold-primary)', marginLeft: '4px' }}>Learn more</a>
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleDecline}
          style={{
            padding: '8px 16px',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="gold-button"
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
};
