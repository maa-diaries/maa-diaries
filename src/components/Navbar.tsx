import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Heart, Lock, Menu, X, User, Info, Compass, Search, Mail } from 'lucide-react';
import logoPng from '../assets/logo.png';

export const Navbar: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    cart, 
    setCartOpen, 
    wishlist,
    searchQuery,
    setSearchQuery,
    setShopCategory
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState(searchQuery);

  useEffect(() => {
    setNavSearch(searchQuery);
  }, [searchQuery]);

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(navSearch);
    setShopCategory('all');
    setActivePage('shop');
    setMobileMenuOpen(false);
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { id: 'home', label: 'Home', icon: null },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'shop', label: 'Collections', icon: Compass },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'contact', label: 'Contact Us', icon: Mail },
    { id: 'account', label: 'My Account', icon: User },
  ] as const;

  const handleNavClick = (pageId: typeof activePage) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div style={{
        background: 'var(--gold-primary)',
        color: '#ffffff',
        fontSize: '0.68rem',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        fontWeight: 500,
        textAlign: 'center',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }} className="nav-announcement">
        <span>✨ 100% Anti-Tarnish Guarantee</span>
        <span className="announcement-separator" style={{ opacity: 0.4 }}>|</span>
        <span>🇮🇳 Free Insured Transit Logistics via Shiprocket</span>
        <span className="announcement-separator" style={{ opacity: 0.4 }}>|</span>
        <span>✨ Handcrafted Premium Rolled Gold</span>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 4px 20px rgba(131, 39, 41, 0.02)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Row 1: Logo, Search, Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 40px',
          width: '100%',
          boxSizing: 'border-box',
          gap: '24px',
          position: 'relative'
        }} className="navbar-row-1">

          {/* Left: Mobile Hamburguer button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              background: 'none',
              border: 'none',
              padding: '6px',
              zIndex: 1002
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
              zIndex: 1001
            }}
            className="navbar-logo-container"
          >
            <img 
              src={logoPng} 
              alt="Maa Diaries Logo" 
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }} className="brand-text-wrapper">
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                letterSpacing: '0.12em',
                fontWeight: 500,
                lineHeight: '1.1',
                color: 'var(--gold-primary)'
              }}>
                MAA DIARIES
              </span>
              <span style={{
                fontSize: '0.52rem',
                letterSpacing: '0.1em',
                color: 'var(--gold-hover)',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginTop: '1px'
              }}>
                Aapki pasand hamari pehchaan
              </span>
            </div>
          </div>

          {/* Center: Wide Search Bar Form (Desktop Only) */}
          <form 
            onSubmit={handleNavSearchSubmit}
            style={{
              position: 'relative',
              flexGrow: 1,
              maxWidth: '500px',
              margin: '0 auto',
            }}
            className="desktop-search-form"
          >
            <input 
              type="text"
              placeholder="Search for gold necklace, earrings, rings..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              style={{
                background: '#fcfbfa',
                border: '1px solid #e5dfd9',
                borderRadius: '4px',
                padding: '10px 80px 10px 42px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-sans)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold-hover)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(171, 141, 79, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5dfd9';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />

          </form>

          {/* Right Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            zIndex: 1001
          }} className="navbar-actions-container">
            {/* Admin Lock */}
            <button
              onClick={() => handleNavClick('admin')}
              style={{
                cursor: 'pointer',
                color: activePage === 'admin' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Admin Portal"
            >
              <Lock size={18} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavClick('shop')}
              style={{
                cursor: 'pointer',
                color: wishlist.length > 0 ? 'var(--gold-primary)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                padding: '6px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Wishlist"
            >
              <Heart size={18} fill={wishlist.length > 0 ? 'var(--gold-primary)' : 'none'} />
              {wishlist.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Drawer Toggle */}
            <button
              onClick={() => setCartOpen(true)}
              style={{
                cursor: 'pointer',
                color: 'var(--text-primary)',
                background: 'none',
                border: 'none',
                padding: '6px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Shopping Cart"
            >
              <ShoppingBag size={18} />
              {cartItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Desktop Category Nav Links */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          padding: '10px 0 12px 0',
          width: '100%',
          background: 'var(--bg-secondary)'
        }} className="desktop-nav">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--gold-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px 0',
                  border: 'none',
                  background: 'none',
                  position: 'relative'
                }}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Row 2: Full-width search bar (Visible only on Mobile) */}
        <div style={{
          display: 'none',
          padding: '0 20px 14px 20px',
          width: '100%',
          boxSizing: 'border-box'
        }} className="mobile-search-row">
          <form 
            onSubmit={handleNavSearchSubmit}
            style={{
              position: 'relative',
              width: '100%'
            }}
          >
            <input 
              type="text"
              placeholder="Search for gold necklace, earrings, rings..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              style={{
                background: '#fcfbfa',
                border: '1px solid #e5dfd9',
                borderRadius: '4px',
                padding: '10px 80px 10px 42px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'var(--font-sans)'
              }}
            />
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />

          </form>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            zIndex: 999,
            background: '#ffffff',
            borderBottom: '1px solid var(--border-light)',
            boxShadow: '0 8px 30px rgba(131, 39, 41, 0.05)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--gold-primary)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '12px 16px',
                    background: isActive ? 'var(--bg-secondary)' : 'transparent',
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: '4px'
                  }}
                >
                  {Icon && <Icon size={14} />}
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick('admin')}
              style={{
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: activePage === 'admin' ? 600 : 500,
                color: activePage === 'admin' ? 'var(--gold-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '12px 16px',
                background: activePage === 'admin' ? 'var(--bg-secondary)' : 'transparent',
                textAlign: 'left',
                width: '100%',
                borderRadius: '4px'
              }}
            >
              <Lock size={14} />
              Admin Dashboard
            </button>
          </div>
        )}
      </nav>

      {/* CSS overrides for desktop/mobile responsive nav */}
      <style>{`
        .nav-link {
          position: relative;
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: var(--gold-hover);
          transition: width 0.3s ease;
        }
        .nav-link:hover {
          color: var(--gold-hover) !important;
        }
        .nav-link:hover::after, .nav-link.active::after {
          width: 100%;
        }
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-search-form {
            display: none !important;
          }
          .mobile-search-row {
            display: block !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .navbar-logo-container {
            position: static !important;
            transform: none !important;
            flex: 1 !important;
            min-width: 0 !important;
          }
          .navbar-row-1 {
            padding: 12px 20px !important;
          }
          .nav-announcement {
            padding: 6px 12px !important;
            font-size: 0.6rem !important;
            gap: 12px !important;
          }
          .announcement-separator {
            display: none !important;
          }
          .brand-text-wrapper {
            align-items: flex-start !important;
          }
          .navbar-actions-container {
            gap: 6px !important;
          }
          .navbar-logo-container img {
            width: 34px !important;
            height: 34px !important;
          }
          .navbar-logo-container span:first-child {
            font-size: 1rem !important;
            letter-spacing: 0.08em !important;
          }
          .nav-announcement span {
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .nav-announcement span:nth-of-type(2), .nav-announcement span:nth-of-type(3) { display: none !important; }
          .navbar-row-1 { gap: 8px !important; padding: 10px 12px !important; }
          .navbar-logo-container { gap: 8px !important; }
          .brand-text-wrapper span:last-child { display: none !important; }
          .mobile-search-row { padding: 0 12px 12px !important; }
        }
        @media (min-width: 901px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-search-form {
            display: block !important;
          }
          .mobile-search-row {
            display: none !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
