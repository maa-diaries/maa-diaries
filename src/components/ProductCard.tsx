import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  badge?: { label: string; color?: string };
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, showRating = false, badge }) => {
  const { wishlist, toggleWishlist } = useStore();
  const navigate = useNavigate();

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div
      className="glass product-card"
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: '#ffffff',
        boxShadow: '0 2px 16px rgba(131,39,41,0.06)'
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 3,
          background: badge.color || 'rgba(131,39,41,0.88)',
          borderRadius: '20px',
          padding: '3px 10px'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>{badge.label}</span>
        </div>
      )}
      {showRating && product.reviewsCount > 0 && (
        <div style={{
          position: 'absolute',
          top: badge ? '42px' : '12px',
          left: '12px',
          zIndex: 3,
          background: 'rgba(241,196,15,0.92)',
          borderRadius: '20px',
          padding: '3px 9px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Star size={11} fill="#fff" color="#fff" />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{product.rating}</span>
        </div>
      )}
      {showRating && product.reviewsCount === 0 && (
        <div style={{
          position: 'absolute',
          top: badge ? '42px' : '12px',
          left: '12px',
          zIndex: 3,
          background: 'rgba(39,174,96,0.9)',
          borderRadius: '20px',
          padding: '3px 9px'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>New</span>
        </div>
      )}

      <button
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 3,
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Heart
          size={18}
          fill={isWishlisted ? 'var(--gold-primary)' : 'none'}
          color={isWishlisted ? 'var(--gold-primary)' : '#999'}
        />
      </button>

      <div
        role="link"
        tabIndex={0}
        aria-label={`View ${product.name}`}
        onClick={() => navigate(`/product/${product.id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/product/${product.id}`); } }}
        style={{
          height: '300px',
          width: '100%',
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0,
          backgroundColor: '#f8f6f4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center'
          }}
        />
      </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <span style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          {product.category}
        </span>
        <h4
          role="link"
          tabIndex={0}
          onClick={() => navigate(`/product/${product.id}`)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/product/${product.id}`); } }}
          style={{
            color: 'var(--text-primary)',
            fontSize: '1rem',
            margin: 0,
            fontWeight: 500,
            lineHeight: 1.3,
            cursor: 'pointer'
          }}
        >
          {product.name}
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ color: 'var(--gold-primary)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.55rem', fontWeight: 400, letterSpacing: '0.02em' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.discount && product.discount > 0 && (
              <span style={{ color: '#cc0c39', fontSize: '0.75rem', fontWeight: 600 }}>-{product.discount}%</span>
            )}
          </div>
          <button
            aria-label={`View ${product.name}`}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{
              background: 'var(--gold-primary)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.04em'
            }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
});
