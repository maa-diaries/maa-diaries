import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb" style={{ padding: '16px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <li><Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link></li>
      {items.map((item, idx) => (
        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
          {item.href ? (
            <Link to={item.href} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{item.label}</Link>
          ) : (
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);
