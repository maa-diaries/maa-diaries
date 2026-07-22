import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    cartOpen, 
    setCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    setCheckoutOpen,
    coupons
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCouponLabel, setAppliedCouponLabel] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCartOpen(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, [setCartOpen]);

  useEffect(() => {
    if (cartOpen) {
      closeBtnRef.current?.focus();
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [cartOpen, handleKeyDown]);

  if (!cartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    const found = coupons.find(c => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError('Invalid coupon code. Please check and try again.');
      setCouponSuccess('');
      setDiscountPercent(0);
      setAppliedCouponLabel('');
      return;
    }
    if (!found.active) {
      setCouponError('This coupon is no longer active.');
      setCouponSuccess('');
      setDiscountPercent(0);
      setAppliedCouponLabel('');
      return;
    }
    if (subtotal < found.minOrder) {
      setCouponError(`Minimum order of ₹${found.minOrder.toLocaleString('en-IN')} required. Add ₹${(found.minOrder - subtotal).toLocaleString('en-IN')} more to use "${found.code}".`);
      setCouponSuccess('');
      setDiscountPercent(0);
      setAppliedCouponLabel('');
      return;
    }
    const pct = found.type === 'percent' ? found.value : Math.round((found.value / Math.max(subtotal, 1)) * 100);
    const label = found.type === 'percent'
      ? `Coupon ${found.code} (${found.value}% off)`
      : `Coupon ${found.code} (₹${found.value} off)`;
    setDiscountPercent(pct);
    setAppliedCouponLabel(label);
    setCouponSuccess(`${found.code} applied — you save ${found.type === 'percent' ? found.value + '%' : '₹' + found.value}!`);
    setCouponError('');
  };

  const handleCheckoutClick = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeInBg 0.3s ease-out'
    }}>
      {/* Click outside backdrop */}
      <div 
        onClick={() => setCartOpen(false)}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
      />

      {/* Drawer Content */}
      <div ref={drawerRef} className="glass" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        borderLeft: '1px solid var(--border-light)',
        borderTop: 'none',
        borderBottom: 'none',
        borderRight: 'none',
        borderRadius: 0,
        backgroundColor: 'var(--bg-secondary)',
        animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Your Cart <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({cart.length} items)</span>
          </h3>
          <button 
            ref={closeBtnRef}
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
            style={{ cursor: 'pointer', color: 'var(--text-primary)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {cart.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 300 }}>Your cart is empty.</span>
              <button 
                onClick={() => setCartOpen(false)}
                className="gold-button-outline"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.key}
                style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)'
                }}>
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      // Fallback for custom rings or broken paths
                      (e.target as HTMLImageElement).src = '/src/assets/logo.svg';
                    }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 500 }}>{item.product.name}</h4>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.05rem', fontWeight: 400, color: 'var(--gold-primary)' }}>
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Configured details */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{item.selectedMetal}</span>
                    <span>•</span>
                    <span>{item.selectedStone}</span>
                    {item.customEngraving && (
                      <>
                        <span>•</span>
                        <span style={{ color: 'var(--gold-primary)', fontStyle: 'italic' }}>
                          "{item.customEngraving}"
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Bar (Quantity & Delete) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-light)',
                      borderRadius: '2px'
                    }}>
                      <button 
                        aria-label="Decrease quantity"
                        onClick={() => updateCartQuantity(item.key, item.quantity - 1)}
                        style={{ cursor: 'pointer', padding: '6px', color: 'var(--text-secondary)' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ width: '32px', textAlign: 'center', fontSize: '0.85rem' }}>
                        {item.quantity}
                      </span>
                      <button 
                        aria-label="Increase quantity"
                        onClick={() => updateCartQuantity(item.key, item.quantity + 1)}
                        style={{ cursor: 'pointer', padding: '6px', color: 'var(--text-secondary)' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button 
                      aria-label="Remove item from cart"
                      onClick={() => removeFromCart(item.key)}
                      style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
                      className="remove-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Billing Area */}
        {cart.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flexShrink: 0,
            position: 'sticky',
            bottom: 0,
            maxHeight: '55vh',
            overflowY: 'auto'
          }}>
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} style={{
              display: 'flex',
              gap: '8px'
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--border-light)',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-primary)'
              }}>
                <Tag size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  aria-label="Enter VIP promo code"
                  placeholder="VIP promo code (MAADIARIES10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    flex: 1,
                    fontSize: '0.8rem',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <button 
                type="submit" 
                className="gold-button-outline"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Apply
              </button>
            </form>

            {/* Promo Messages */}
            {couponSuccess && (
              <span style={{ fontSize: '0.75rem', color: '#2ecc71' }}>{couponSuccess}</span>
            )}
            {couponError && (
              <span style={{ fontSize: '0.75rem', color: '#e74c3c' }}>{couponError}</span>
            )}

            {/* Subtotal details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2ecc71' }}>
                  <span>{appliedCouponLabel || 'VIP Discount'}</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', margin: '4px 0' }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 600
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold-primary)' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button 
              onClick={handleCheckoutClick}
              className="gold-button"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                marginTop: '4px'
              }}
            >
              Proceed to Secure Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .remove-btn:hover {
          color: #e74c3c !important;
        }
        @keyframes fadeInBg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
