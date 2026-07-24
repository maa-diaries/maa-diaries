import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Key, ShieldCheck, AlertCircle } from 'lucide-react';

export const ResetPasswordModal: React.FC = () => {
  const { 
    resetPasswordOpen, 
    setResetPasswordOpen, 
    updatePassword 
  } = useStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!resetPasswordOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password length check
    const minLength = 6;
    
    if (password.length < minLength) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword(password);
      if (result.success) {
        setSuccess("Your password has been reset successfully! You can now access your account with your new password.");
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div className="glass" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '36px 30px',
        boxShadow: '0 20px 40px rgba(131, 39, 41, 0.1)',
        border: '1px solid var(--border-light)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Close Button */}
        {!success && (
          <button 
            onClick={() => setResetPasswordOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        )}

        {/* Content */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              color: '#27ae60',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <ShieldCheck size={32} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              color: 'var(--text-primary)',
              margin: '0 0 10px 0',
              fontWeight: 300
            }}>
              Password Updated
            </h2>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}>
              {success}
            </p>
            <button
              onClick={() => setResetPasswordOpen(false)}
              className="gold-button"
              style={{ width: '100%', height: '44px' }}
            >
              Continue to Account
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--gold-light)',
                color: 'var(--gold-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Key size={22} />
              </div>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                color: 'var(--text-primary)',
                margin: 0,
                fontWeight: 300
              }}>
                Reset Password
              </h2>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginTop: '6px'
              }}>
                Please enter a secure new password for your account.
              </p>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(231, 76, 60, 0.08)',
                border: '1px solid rgba(231, 76, 60, 0.15)',
                color: '#e74c3c',
                fontSize: '0.8rem',
                marginBottom: '20px',
                lineHeight: 1.4
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="search-input"
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    fontSize: '0.9rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="search-input"
                  placeholder="Confirm secure password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    fontSize: '0.9rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <button
                type="submit"
                className="gold-button"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '44px',
                  marginTop: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1
                }}
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
