import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const Wishlist: React.FC = () => {
  const { products, wishlist } = useStore();
  const navigate = useNavigate();

  const wishlistProducts = wishlist
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px', minHeight: '60vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
        <Heart size={26} style={{ color: 'var(--gold-primary)' }} fill="var(--gold-primary)" />
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400, margin: 0 }}>My Wishlist</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved</p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <Heart size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
          <h2 style={{ fontWeight: 400, marginBottom: '8px', color: 'var(--text-primary)' }}>Your wishlist is empty</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>Tap the heart icon on any product to save it here.</p>
          <button onClick={() => navigate('/shop')} className="gold-button" style={{ padding: '12px 32px', fontSize: '0.9rem' }}>
            Browse Collection
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {wishlistProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
