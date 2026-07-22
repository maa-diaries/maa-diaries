import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Truck, HelpCircle, Heart } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQs: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'general' | 'care' | 'shipping'>('general');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqData: Record<'general' | 'care' | 'shipping', FAQItem[]> = {
    general: [
      {
        question: "What is Anti-Tarnish Gold Plating?",
        answer: "Our gold jewelry is crafted using premium gold plating, which applies a thick layer of real gold over a high-quality base metal (such as brass or stainless steel). We then seal it with an advanced organic E-coating (protective polymer seal). This gives the jewelry the rich, lustrous look of solid gold while making it waterproof, sweatproof, and highly resistant to tarnishing."
      },
      {
        question: "Is your jewelry hypoallergenic?",
        answer: "Yes, all Maa Diaries jewelry is 100% hypoallergenic, nickel-free, lead-free, and cadmium-free. We use skin-safe brass or surgical-grade stainless steel bases, making them perfectly safe even for the most sensitive ears and skin."
      },
      {
        question: "What does 'Anti-Tarnish' mean?",
        answer: "Our jewelry is coated with a premium, invisible organic E-coating (protective polymer seal). This shield prevents moisture, sweat, oxygen, and cosmetics from reaching the metal underneath, ensuring that the jewelry does not oxidize or turn black over time."
      }
    ],
    care: [
      {
        question: "Can I wear the jewelry in the shower or gym?",
        answer: "Yes, our anti-tarnish items are waterproof and sweatproof. However, to maximize the lifespan of the plating, we recommend keeping them away from harsh chemical agents, perfumes, bleach, and hot springs."
      },
      {
        question: "How should I clean my jewelry?",
        answer: "To clean your pieces, simply wipe them gently with a soft microfiber cloth after wear to remove any oils. If needed, rinse with lukewarm soapy water and pat completely dry. Avoid abrasive metal polishes or ultrasonic jewelry cleaners."
      },
      {
        question: "How should I store my anti-tarnish jewelry?",
        answer: "When not in use, we recommend storing each piece individually in the velvet pouches or custom air-tight premium gift boxes provided by Maa Diaries. Keeping them separated prevents scratches and minimizes exposure to open air."
      }
    ],
    shipping: [
      {
        question: "What are your shipping times within India?",
        answer: "We ship all orders via Shiprocket express services. Metro cities (Mumbai, Delhi, Bangalore, etc.) typically receive packages within 2-3 business days. Tier-2 and Tier-3 cities receive orders within 3-5 business days, and remote areas may take up to 5-7 days."
      },
      {
        question: "Do you offer Cash on Delivery (COD)?",
        answer: "Yes, Cash on Delivery is available for all orders across India with a small COD handling fee of ₹50. Free shipping is provided for all prepaid orders above ₹999."
      },
      {
        question: "What is your Return and Exchange policy?",
        answer: "We offer a hassle-free 7-day return and exchange policy for any manufacturing defects or sizing issues. Please ensure the jewelry remains unworn, in its original packaging, and submit an exchange request via our Contact Us form."
      }
    ]
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const categories = [
    { id: 'general', label: 'General Questions', icon: HelpCircle },
    { id: 'care', label: 'Jewelry Care', icon: Heart },
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck }
  ] as const;

  return (
    <div className="page-shell" style={{ maxWidth: '900px', margin: '64px auto 60px', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Got Questions?</span>
        <h1 className="gold-text-gradient" style={{ fontSize: '3rem', marginTop: '12px', fontWeight: 300 }}>FAQs & Help</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Everything you need to know about our products, shipping, and care guidelines.</p>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setExpandedIndex(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                background: isActive ? 'var(--gold-light)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--gold-primary)' : '1px solid transparent',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'var(--transition-fast)'
              }}
            >
              <Icon size={18} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqData[activeCategory].map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div 
              key={idx} 
              className="glass" 
              style={{ 
                borderRadius: '6px', 
                overflow: 'hidden', 
                transition: 'var(--transition-fast)',
                border: isExpanded ? '1px solid var(--border-focus)' : '1px solid var(--border-light)'
              }}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleExpand(idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 500, color: isExpanded ? '#fff' : 'var(--text-primary)' }}>{item.question}</span>
                <span style={{ color: 'var(--gold-primary)' }}>{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
              </button>
              
              {/* Answer Box */}
              {isExpanded && (
                <div style={{ padding: '0 24px 24px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,0.02)', marginTop: '0' }}>
                  <p style={{ paddingTop: '16px' }}>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
