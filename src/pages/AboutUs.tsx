import React from 'react';
import { Heart, Sparkles, Shield, Gem, Droplets, Truck } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="page-shell" style={{ maxWidth: '1200px', margin: '64px auto 60px', padding: '0 24px' }}>
      {/* Hero Section */}
      <div className="about-hero" style={{ textAlign: 'center', marginBottom: '64px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Our Journey</span>
        <h1 className="gold-text-gradient" style={{ fontSize: '3rem', marginTop: '12px', marginBottom: '24px', fontWeight: 300 }}>Maa Diaries</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.8 }}>
          Crafting memories, celebrating everyday elegance, and bringing you the finest selection of tarnish-free, sweatproof, and hypoallergenic rolled gold jewelry and girlish essentials.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="two-column-layout about-story" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '72px' }}>
        <div className="about-story-copy">
          <span className="about-kicker">THE MAA DIARIES PROMISE</span>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 300 }}>Bringing Love From Maa</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px' }}>
            <strong>Maa Diaries</strong> is a tribute to the timeless elegance and quiet resilience of women who carry history, grace, and devotion in every step. Inspired by the legendary strength and poise of historical figures—and rooted in the divine essence of Goddess Lakshmi’s abundance and Goddess Parvati’s steadfast power—our collection celebrates the multi-faceted woman.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px' }}>
            From managing the heart of the home in traditional ornaments that echo centuries of heritage, to slaying daily outdoor chores with effortless poise and authority, these women remind us that tradition is not a thing of the past—it is a living art.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <strong>Maa Diaries</strong> honors every woman who seamlessly weaves sacred beauty, inner power, and modern life together, making every moment an homage to the divine feminine.
          </p>
        </div>
        <div className="glass" style={{ padding: '40px', borderRadius: '8px', borderLeft: '4px solid var(--gold-primary)' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', color: 'var(--text-primary)' }}>Our Core Pillars</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ color: 'var(--gold-primary)', marginTop: '4px' }}><Sparkles size={24} /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Premium Rolled Gold Plating</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>5x thicker micro-plating than standard fashion jewelry, delivering rich gold tone and depth.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ color: 'var(--gold-primary)', marginTop: '4px' }}><Shield size={24} /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Lifetime Anti-Tarnish Coating</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Coated with a highly durable, clear protective barrier that blocks oxidation, sweat, and moisture.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ color: 'var(--gold-primary)', marginTop: '4px' }}><Heart size={24} /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Skin-Friendly & Hypoallergenic</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>100% free from nickel, lead, and cadmium. Engineered to be completely safe for sensitive skin.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner / Stat Grid */}
      <div className="glass stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '30px', padding: '50px 30px', borderRadius: '4px', textAlign: 'center', marginBottom: '80px' }}>
        <div>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 300, marginBottom: '8px' }}>15k+</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Happy Customers</p>
        </div>
        <div>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 300, marginBottom: '8px' }}>100%</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tarnish-Free Guarantee</p>
        </div>
        <div>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 300, marginBottom: '8px' }}>24/7</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer Support</p>
        </div>
        <div>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 300, marginBottom: '8px' }}>India</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fast Shipping Nationwide</p>
        </div>
      </div>

      <section className="about-difference" style={{ marginBottom: '72px' }}>
        <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 30px' }}>
          <span className="about-kicker">MADE FOR REAL LIFE</span>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px', fontWeight: 300 }}>Jewelry that keeps up with you</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65 }}>Thoughtful details, trusted materials, and easy everyday styling—made to be worn and loved, not kept away.</p>
        </div>
        <div className="about-difference-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
          <div className="about-difference-card"><Gem size={23} /><h3>Thoughtfully Curated</h3><p>Every piece is chosen for its finish, comfort, and effortless styling potential.</p></div>
          <div className="about-difference-card"><Droplets size={23} /><h3>Made for Every Day</h3><p>Water-resistant, sweat-friendly pieces designed for your regular routine.</p></div>
          <div className="about-difference-card"><Truck size={23} /><h3>Carefully Delivered</h3><p>Secure packaging and reliable nationwide delivery for every special order.</p></div>
        </div>
      </section>

      <section className="about-closing">
        <Heart size={20} fill="currentColor" />
        <div><span>OUR PROMISE TO YOU</span><h2>Little luxuries, made with a mother’s care.</h2></div>
        <p>From the first scroll to the final unboxing, we want every Maa Diaries experience to feel personal, considered, and joyful.</p>
      </section>
    </div>
  );
};
