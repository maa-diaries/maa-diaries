import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Page crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(231, 76, 60, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            fontSize: '1.5rem'
          }}>
            !
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            marginBottom: '12px',
            fontWeight: 400
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '24px',
            maxWidth: '400px',
            lineHeight: 1.6
          }}>
            We apologize for the inconvenience. Please try refreshing the page or contact us if this persists.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                backgroundColor: 'var(--gold-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.03em'
              }}
            >
              Refresh Page
            </button>
            <a
              href="/"
              style={{
                padding: '10px 24px',
                border: '1px solid var(--gold-primary)',
                color: 'var(--gold-primary)',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.03em'
              }}
            >
              Go Home
            </a>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#e74c3c',
              maxWidth: '600px',
              overflow: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
