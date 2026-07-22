import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import logoPng from '../assets/logo.png';

export const Footer: React.FC = () => {
  const { siteSettings } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const policies: Record<string, { title: string; content: string }> = useMemo(() => ({
    shipping: {
      title: "Shipping Policy",
      content: `We deliver to PIN codes all over India. All orders are processed within 1-2 business days. Express delivery via Shiprocket takes 2-4 business days for metro cities, and 4-6 business days for the rest of India. Prepaid orders above ₹${siteSettings.freeShippingThreshold} qualify for Free Shipping. A shipping charge of ₹80 applies to orders below ₹${siteSettings.freeShippingThreshold}, and ₹50 extra for COD orders.`
    },
    return: {
      title: "Return & Exchange Policy",
      content: "We offer a 7-day hassle-free exchange or return policy for any products that arrive damaged or with manufacturing defects. Due to hygiene reasons, hair accessories (clutchers and scrunchies) cannot be returned unless they arrive broken. Please record an unboxing video to assist with damage claims."
    },
    refund: {
      title: "Cancellation & Refund Policy",
      content: `You may cancel your order within 6 hours of placement by writing to ${siteSettings.supportEmail}. Once dispatched via Shiprocket, orders cannot be cancelled. For returned products, refunds are processed within 3-5 business days back to your original payment method (via PayU gateway simulation) or as store credits for future purchases.`
    },
    privacy: {
      title: "Privacy Policy",
      content: "Maa Diaries respects your privacy. We collect personal information (name, address, email, phone) solely to fulfill your orders, calculate delivery estimates, and coordinate logistics via Shiprocket. We do not sell, rent, or share customer database records with third-party marketing networks."
    },
    terms: {
      title: "Terms & Conditions",
      content: "By purchasing from Maa Diaries, you agree to these terms. All prices listed are in INR (Indian Rupees) inclusive of local taxes. We reserve the right to modify pricing or update product specs. Our anti-tarnish jewelry is sweatproof and water-resistant, but longevity depends on compliance with care guidelines."
    }
  }), [siteSettings]);

  const policyModalCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activePolicy) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePolicy(null);
    };
    document.addEventListener('keydown', handleEscape);
    // Focus the close button when modal opens
    setTimeout(() => policyModalCloseRef.current?.focus(), 100);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activePolicy]);

  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-light)',
      padding: '60px 24px 30px 24px',
      marginTop: 'auto',
      zIndex: 10,
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Brand Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoPng} alt="Maa Diaries Logo" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
            <div>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                letterSpacing: '0.1em',
                color: 'var(--text-primary)'
              }}>MAA DIARIES</span>
              <br />
              <span style={{
                fontSize: '0.55rem',
                letterSpacing: '0.1em',
                color: 'var(--gold-primary)',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>Aapki pasand hamari pehchaan</span>
            </div>
          </div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            lineHeight: '1.6',
            fontWeight: 300
          }}>
            Premium boutique specializing in micro-plated 18k Rolled Gold, water-resistant anti-tarnish jewelry, and high-quality hair aesthetics.
          </p>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <a 
              href="https://www.facebook.com/share/1ESCYJgAQA/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gold-light)';
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.color = 'var(--gold-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/maadiaries_?igsh=MTkxNGlydGhscXR6aA==" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gold-light)';
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.color = 'var(--gold-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a 
              href={`https://wa.me/${siteSettings.whatsapp}?text=Hello!%20I%20am%20browsing%20the%20Maa%20Diaries%20website%20and%20would%20like%20some%20assistance.`} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="WhatsApp" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gold-light)';
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.color = 'var(--gold-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              title="Chat on WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
            <a 
              href={`tel:${siteSettings.supportPhone}`} 
              aria-label="Phone" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gold-light)';
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.color = 'var(--gold-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              title="Call Us"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 style={{
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '16px',
            color: 'var(--gold-primary)',
            fontWeight: 600
          }}>Explore</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop Collections</Link></li>
            <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Our Story (About Us)</Link></li>
            <li><Link to="/orders" style={{ color: 'inherit', textDecoration: 'none' }}>Track Your Orders</Link></li>
            <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link></li>
          </ul>
        </div>

        {/* Policies Column */}
        <div>
          <h4 style={{
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '16px',
            color: 'var(--gold-primary)',
            fontWeight: 600
          }}>Policies</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <li><button onClick={() => setActivePolicy('shipping')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', textAlign: 'left' }}>Shipping Policy</button></li>
            <li><button onClick={() => setActivePolicy('return')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', textAlign: 'left' }}>Return & Exchange</button></li>
            <li><button onClick={() => setActivePolicy('refund')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', textAlign: 'left' }}>Cancellation & Refund</button></li>
            <li><button onClick={() => setActivePolicy('privacy')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', textAlign: 'left' }}>Privacy Policy</button></li>
            <li><button onClick={() => setActivePolicy('terms')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', textAlign: 'left' }}>Terms & Conditions</button></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--gold-primary)',
            fontWeight: 600
          }}>Maa Diaries Club</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 300, lineHeight: '1.5' }}>
            Subscribe to receive alerts for coupons, secret flash sales, and jewelry care tips.
          </p>
          <form onSubmit={handleSubscribe} style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '6px'
          }}>
            <input
              type="email"
              aria-label="Email address for newsletter subscription"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                outline: 'none'
              }}
            />
            <button type="submit" style={{
              cursor: 'pointer',
              color: subscribed ? '#2ecc71' : 'var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 8px'
            }}>
              {subscribed ? <Check size={14} /> : <Send size={14} />}
            </button>
          </form>
          {subscribed && (
            <span style={{ fontSize: '0.75rem', color: '#2ecc71', transition: 'var(--transition-fast)' }}>
              Thank you! Welcome to the family.
            </span>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }} />

      {/* Address & Copyright */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} style={{ color: 'var(--gold-primary)' }} /> {siteSettings.supportAddress}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={12} style={{ color: 'var(--gold-primary)' }} /> {siteSettings.supportPhone}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Mail size={12} style={{ color: 'var(--gold-primary)' }} /> {siteSettings.supportEmail}
          </span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Maa Diaries. All Rights Reserved.
        </div>
      </div>

      {/* Policy Modal Overlay */}
      {activePolicy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={policies[activePolicy].title}
          onClick={() => setActivePolicy(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
        >
          <div className="glass" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '600px',
            width: '100%',
            padding: '30px',
            borderRadius: '8px',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              {policies[activePolicy].title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {policies[activePolicy].content}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                ref={policyModalCloseRef}
                onClick={() => setActivePolicy(null)}
                className="gold-button"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
