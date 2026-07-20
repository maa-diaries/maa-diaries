import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, ShoppingBag, ArrowRight, MapPin, Heart, PackageCheck, ChevronRight, ShieldCheck, LogOut, XCircle, Gift, Trash2 } from 'lucide-react';

export const MyAccount: React.FC = () => {
  const { 
    orders, 
    setActivePage, 
    setSelectedOrderId, 
    currentUser, 
    loginUser, 
    registerUser, 
    logoutUser,
    wishlist,
    toggleWishlist,
    products,
    setSelectedProductId
  } = useStore();

  const [activeSection, setActiveSection] = useState<'orders'|'wishlist'|'address'|'refer'>('orders');

  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form states - Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [regPincode, setRegPincode] = useState('');

  // Handle direct tracking click
  const handleTrackOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActivePage('orders');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields.");
      return;
    }
    const success = loginUser(loginEmail, loginPassword);
    if (!success) {
      setError("Invalid Email/Phone or Password. Try registering first!");
    } else {
      setError(null);
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPassword || !regAddress || !regCity || !regState || !regPincode) {
      setError("All fields are required to register.");
      return;
    }
    if (regPhone.length !== 10 || isNaN(Number(regPhone))) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (regPincode.length !== 6 || isNaN(Number(regPincode))) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    const success = registerUser({
      name: regName,
      email: regEmail,
      phone: regPhone,
      addressLine: regAddress,
      city: regCity,
      state: regState,
      pincode: regPincode,
      password: regPassword
    });

    if (!success) {
      setError("Email or Phone number is already registered.");
    } else {
      setError(null);
      // Reset registration form
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegAddress('');
      setRegCity('');
      setRegState('');
      setRegPincode('');
    }
  };

  // Filter orders for the logged-in user
  const userOrders = currentUser
    ? orders.filter(
        (order) =>
          order.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          order.customerPhone === currentUser.phone
      )
    : [];

  // RENDER: Logged Out (Auth portal)
  if (!currentUser) {
    return (
      <div className="page-shell" style={{ maxWidth: '480px', margin: '80px auto 80px', padding: '0 24px', minHeight: '70vh' }}>
        <div className="glass" style={{
          padding: '40px 30px',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 30px rgba(131, 39, 41, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gold-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)', marginBottom: '14px' }}>
              <User size={24} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', margin: 0, fontWeight: 300 }}>
              {isRegister ? "Create Client Account" : "Client Portal Sign In"}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
              {isRegister ? "Join Maa Diaries to track orders & save preferences" : "Access your order history & faster checkout"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(231, 76, 60, 0.08)',
              border: '1px solid rgba(231, 76, 60, 0.2)',
              color: '#e74c3c',
              fontSize: '0.8rem',
              marginBottom: '20px',
              lineHeight: 1.4
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          {isRegister ? (
            <form onSubmit={handleRegisterSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Full Name</label>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="e.g. Satya Sharma" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="search-input" 
                    placeholder="name@example.com" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Mobile Number</label>
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="10-digit number" 
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Password</label>
                <input 
                  type="password" 
                  className="search-input" 
                  placeholder="Create password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Street Address</label>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Flat, House no., Building, Street" 
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>City</label>
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="City" 
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>State</label>
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="State" 
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>PIN Code</label>
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="6 digits" 
                    maxLength={6}
                    value={regPincode}
                    onChange={(e) => setRegPincode(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <button type="submit" className="gold-button" style={{ width: '100%', height: '44px', marginTop: '12px' }}>
                Register Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Email Address or Phone</label>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Enter email or 10-digit phone" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Password</label>
                <input 
                  type="password" 
                  className="search-input" 
                  placeholder="Enter your password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', fontSize: '0.9rem', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                />
              </div>

              <button type="submit" className="gold-button" style={{ width: '100%', height: '44px', marginTop: '8px' }}>
                Sign In
              </button>
            </form>
          )}

          {/* Toggle Button */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', width: '100%', paddingTop: '18px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isRegister ? "Already have an account?" : "New to Maa Diaries?"}
            </span>
            <button 
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginLeft: '6px',
                textDecoration: 'underline'
              }}
            >
              {isRegister ? "Sign In Here" : "Register / Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Logged In (Dashboard)
  return (
    <div className="page-shell" style={{ maxWidth: '1280px', margin: '64px auto 60px', padding: '0 24px', minHeight: '80vh' }}>
      
      {/* Welcome Banner */}
      <div className="account-banner" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        padding: '30px 40px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
            <User size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', margin: 0, fontWeight: 300 }}>
              Namaste, {currentUser.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Welcome back to your luxury jewelry space. Track your orders, manage addresses, and profile settings.
            </p>
          </div>
        </div>
        <div>
          <button onClick={() => setActivePage('shop')} className="gold-button" style={{ padding: '10px 24px' }}>
            Browse Collections
          </button>
        </div>
      </div>

      {/* Account Stats */}
      <div className="account-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="account-stat glass"><ShoppingBag size={20} /><div><strong>{userOrders.length}</strong><span>Total Orders</span></div></div>
        <div className="account-stat glass"><PackageCheck size={20} /><div><strong>{userOrders.filter(order => order.status === 'Delivered').length}</strong><span>Delivered</span></div></div>
        <div className="account-stat glass" style={{ borderLeft: '3px solid #e74c3c' }}><XCircle size={20} style={{ color: '#e74c3c' }} /><div><strong style={{ color: '#e74c3c' }}>{userOrders.filter(order => order.status === 'Cancelled').length}</strong><span>Cancelled</span></div></div>
        <div className="account-stat glass"><Heart size={20} /><div><strong>0</strong><span>Saved Pieces</span></div></div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-primary)' }}>Quick Actions</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Account</span>
        </div>
        <div className="account-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <button onClick={() => setActiveSection('orders')} className="account-action" style={{ borderColor: activeSection==='orders' ? 'var(--gold-primary)' : undefined }}><PackageCheck size={19} /><span>Order History</span><ChevronRight size={16} /></button>
          <button onClick={() => setActiveSection('wishlist')} className="account-action" style={{ borderColor: activeSection==='wishlist' ? 'var(--gold-primary)' : undefined }}><Heart size={19} /><span>My Wishlist ({wishlist.length})</span><ChevronRight size={16} /></button>
          <button onClick={() => setActiveSection('address')} className="account-action" style={{ borderColor: activeSection==='address' ? 'var(--gold-primary)' : undefined }}><MapPin size={19} /><span>Saved Address</span><ChevronRight size={16} /></button>
          <button onClick={() => setActiveSection('refer')} className="account-action" style={{ borderColor: activeSection==='refer' ? 'var(--gold-primary)' : undefined }}><Gift size={19} /><span>Refer & Earn</span><ChevronRight size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }} className="account-grid">
        {/* Left Side: Profile & Address Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Profile Card */}
          <div className="glass" style={{ padding: '30px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Profile Details</h3>
              <button 
                onClick={logoutUser} 
                className="account-text-button" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Default Name</span>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px', margin: 0 }}>{currentUser.name}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Primary Phone</span>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px', margin: 0 }}>+91 {currentUser.phone}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Primary Email</span>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px', margin: 0 }}>{currentUser.email}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="glass" style={{ padding: '30px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Default Address</h3>
              <MapPin size={17} style={{ color: 'var(--gold-primary)' }} />
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{currentUser.name}</strong><br />
              {currentUser.addressLine}<br />
              {currentUser.city}, {currentUser.state} - {currentUser.pincode}<br />
              India
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldCheck size={21} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '5px' }}>Maa Diaries Care</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Your anti-tarnish care guide and order support are always one tap away.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Dynamic Section Panel */}
        <div className="glass" style={{ padding: '36px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: '#ffffff', minHeight: '400px' }}>

          {/* ── ORDER HISTORY ── */}
          {activeSection === 'orders' && (<>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              <ShoppingBag size={19} style={{ color: 'var(--gold-primary)' }} /> Order History ({userOrders.length})
            </h2>
            {userOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 24px' }}>
                <ShoppingBag size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ fontWeight: 400, marginBottom: '8px' }}>No orders yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>Start exploring our premium jewelry collections.</p>
                <button onClick={() => setActivePage('shop')} className="gold-button" style={{ padding: '10px 28px' }}>Start Shopping</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {userOrders.map(order => (
                  <div key={order.id} style={{ border: '1px solid var(--border-light)', borderRadius: '6px', padding: '18px', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>#{order.id}</h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ padding: '3px 9px', borderRadius: '3px', fontSize: '0.72rem', fontWeight: 600, background: order.status==='Delivered'?'rgba(46,204,113,0.1)':order.status==='Cancelled'?'rgba(231,76,60,0.1)':'rgba(241,196,15,0.1)', color: order.status==='Delivered'?'#2ecc71':order.status==='Cancelled'?'#e74c3c':'#b38600', border: `1px solid ${order.status==='Delivered'?'#2ecc71':order.status==='Cancelled'?'#e74c3c':'rgba(241,196,15,0.4)'}` }}>{order.status}</span>
                        <button onClick={() => handleTrackOrderClick(order.id)} style={{ background:'none',border:'none',color:'var(--gold-primary)',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',fontSize:'0.82rem',fontWeight:500 }}>Track <ArrowRight size={13} /></button>
                      </div>
                    </div>
                    {order.items.map((it:any,idx:number)=>(<div key={idx} style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',color:'var(--text-secondary)',padding:'4px 0',borderTop:idx===0?'1px solid var(--border-light)':undefined}}><span>{it.product.name} x{it.quantity}</span><span style={{color:'var(--text-primary)',fontWeight:500}}>₹{it.product.price*it.quantity}</span></div>))}
                    <div style={{ marginTop:'10px', display:'flex', justifyContent:'flex-end' }}><span style={{ color:'var(--gold-primary)', fontWeight:600 }}>Total: ₹{order.totalAmount}</span></div>
                  </div>
                ))}
              </div>
            )}
          </>)}

          {/* ── WISHLIST ── */}
          {activeSection === 'wishlist' && (<>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              <Heart size={19} style={{ color: 'var(--gold-primary)' }} /> My Wishlist ({wishlist.length})
            </h2>
            {wishlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 24px' }}>
                <Heart size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ fontWeight: 400, marginBottom: '8px' }}>Your wishlist is empty</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>Heart products you love to save them here.</p>
                <button onClick={() => setActivePage('shop')} className="gold-button" style={{ padding: '10px 28px' }}>Browse Collection</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '18px' }}>
                {wishlist.map(pid => {
                  const prod = products.find(p => p.id === pid);
                  if (!prod) return null;
                  return (
                    <div key={pid} style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                      <div onClick={() => { setSelectedProductId(prod.id); setActivePage('product-details'); }} style={{ height: '160px', backgroundImage: `url(${prod.image})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }} />
                      <div style={{ padding: '12px' }}>
                        <p style={{ fontSize: '0.82rem', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--text-primary)', lineHeight: 1.3 }}>{prod.name}</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', fontWeight: 700, margin: '0 0 10px 0' }}>₹{prod.price.toLocaleString('en-IN')}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setSelectedProductId(prod.id); setActivePage('product-details'); }} style={{ flex: 1, padding: '6px', fontSize: '0.72rem', fontWeight: 600, background: 'var(--gold-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                          <button onClick={() => toggleWishlist(pid)} style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>)}

          {/* ── SAVED ADDRESS ── */}
          {activeSection === 'address' && (<>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              <MapPin size={19} style={{ color: 'var(--gold-primary)' }} /> Saved Addresses
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '2px solid var(--gold-primary)', borderRadius: '8px', padding: '24px', background: 'var(--bg-secondary)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '12px', right: '14px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold-primary)', background: 'var(--gold-light)', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>Default</span>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>{currentUser?.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                  {currentUser?.addressLine}<br />
                  {currentUser?.city}, {currentUser?.state} — {currentUser?.pincode}<br />
                  India<br />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>📞 +91 {currentUser?.phone}</span>
                </p>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>To update your address, please contact us via WhatsApp or email.</p>
            </div>
          </>)}

          {/* ── REFER & EARN ── */}
          {activeSection === 'refer' && (<>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              <Gift size={19} style={{ color: 'var(--gold-primary)' }} /> Refer & Earn
            </h2>
            <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--gold-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)', marginBottom: '18px' }}><Gift size={32} /></div>
              <h3 style={{ fontWeight: 400, fontSize: '1.4rem', marginBottom: '10px' }}>Share the Love, Earn Rewards</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 28px', lineHeight: 1.6 }}>Refer a friend to Maa Diaries and earn ₹200 store credit when they place their first order!</p>
              <div style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--gold-primary)', borderRadius: '8px', padding: '20px', marginBottom: '24px', maxWidth: '340px', margin: '0 auto 24px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Referral Code</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-primary)', letterSpacing: '0.15em', margin: 0 }}>MD{currentUser?.phone?.slice(-4) || 'XXXX'}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(`MD${currentUser?.phone?.slice(-4)}`); }} className="gold-button" style={{ padding: '10px 32px' }}>Copy Code</button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginTop: '32px' }}>
                {[{label:'Friends Referred',val:'0'},{label:'Rewards Earned',val:'₹0'},{label:'Pending Rewards',val:'₹0'}].map(s=>(
                  <div key={s.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold-primary)', margin: '0 0 4px 0' }}>{s.val}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>)}

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .account-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
