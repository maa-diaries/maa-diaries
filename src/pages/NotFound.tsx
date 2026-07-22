import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '60px 24px',
      textAlign: 'center'
    }}>
      <span style={{
        fontSize: '6rem',
        fontFamily: 'var(--font-serif)',
        color: 'var(--gold-primary)',
        fontWeight: 300,
        lineHeight: 1
      }}>
        404
      </span>
      <h2 style={{
        fontSize: '1.5rem',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-serif)',
        fontWeight: 400,
        margin: '16px 0 8px'
      }}>
        Page Not Found
      </h2>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        maxWidth: '400px',
        lineHeight: 1.6,
        marginBottom: '32px'
      }}>
        The piece you are looking for may have been moved or is no longer available.
      </p>
      <div style={{ display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto 20px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`); }}
          placeholder="Search for jewelry..."
          style={{ flex: 1, padding: '12px 16px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        />
        <button onClick={() => { if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`); }} className="gold-button" style={{ padding: '12px 20px' }}>Search</button>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="gold-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Home size={16} /> Home
        </button>
      </div>
    </div>
  );
};
