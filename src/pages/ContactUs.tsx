import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, Clock, MessageSquare, CheckCircle } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const { submitInquiry } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setLoading(true);
    setTimeout(() => {
      submitInquiry(formData);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  const handleWhatsAppRedirect = () => {
    // Open a mock WhatsApp chat with pre-filled text
    const text = encodeURIComponent("Hello Maa Diaries team! I have an inquiry about my order.");
    window.open(`https://wa.me/918448229528?text=${text}`, '_blank');
  };

  return (
    <div className="page-shell" style={{ maxWidth: '1200px', margin: '64px auto 60px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Get in Touch</span>
        <h1 className="gold-text-gradient" style={{ fontSize: '3rem', marginTop: '12px', fontWeight: 300 }}>Feedback & Contact Us</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>We would love to hear from you. Send us your feedback, suggestions, or general inquiries.</p>
      </div>

      <div className="two-column-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
        {/* Info Side */}
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', fontWeight: 300 }}>Support & Location Details</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '40px' }}>
            Have a question about order delivery, sizing, or anti-tarnish jewelry care? Feel free to write to us or ping us directly on WhatsApp. Our customer service team is always here to assist you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                <Mail size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Email Support</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>support@maadiaries.com</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                <Phone size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>WhatsApp & Call Support</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>+91 84482 29528</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                <Clock size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Business Hours</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mon - Sat: 10:00 AM - 7:00 PM IST</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleWhatsAppRedirect}
            style={{ marginTop: '40px', background: '#25D366', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem' }}
          >
            <MessageSquare size={20} />
            Chat directly on WhatsApp
          </button>
        </div>

        {/* Message Form Side */}
        <div className="glass" style={{ padding: '40px', borderRadius: '6px' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', color: 'var(--text-primary)', fontWeight: 400 }}>Submit Feedback / Inquiry</h3>
          
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--gold-primary)' }}><CheckCircle size={60} /></div>
              <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>Thank you!</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Your message has been logged in our system. A customer care agent will review it and contact you via email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Full Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '2px', color: 'var(--text-primary)' }} 
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Email Address *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '2px', color: 'var(--text-primary)' }} 
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '2px', color: 'var(--text-primary)' }} 
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Message *</label>
                <textarea 
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '2px', color: 'var(--text-primary)', resize: 'vertical' }} 
                  placeholder="How can we help you?"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="gold-button"
                style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              >
                {loading ? 'Submitting Form...' : 'Send Feedback & Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
