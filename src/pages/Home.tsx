import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  ArrowRight, Award, ShieldCheck, Heart, 
  Truck, MessageSquare, Clipboard, Check, Star
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

const defaultCategories = [
  { id: 'earrings', name: 'Earrings', desc: 'Western & Traditional', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=400&q=80' },
  { id: 'necklaces', name: 'Necklaces', desc: 'Chains & Chokers', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80' },
  { id: 'bracelets', name: 'Bracelets', desc: 'Delicate wristwear', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80' },
  { id: 'pendants', name: 'Pendants', desc: 'Minimalist statement charms', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' },
  { id: 'payals', name: 'Payals', desc: 'Elegant traditional anklets', image: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=400&q=80' },
  { id: 'kashmiri_jhumke', name: 'Kashmiri Jhumke', desc: 'Intricate royal bells', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80' },
  { id: 'hair_accessories', name: 'Hair Accessories', desc: 'Clutchers & Scrunchies', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=400&q=80' }
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    handler(mq);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const { setShopCategory, products, siteSettings, coupons, cart } = useStore();
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [igModalUrl, setIgModalUrl] = useState<string | null>(null);

  useEffect(() => {
    document.title = siteSettings.seoTitle;
    let description = document.querySelector('meta[name="description"]');
    if (!description) { description = document.createElement('meta'); description.setAttribute('name', 'description'); document.head.appendChild(description); }
    description.setAttribute('content', siteSettings.seoDescription);
  }, [siteSettings]);

  const couponsRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const instagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupAutoScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
      const el = ref.current;
      if (!el) return;

      let isPaused = false;
      let intervalId: any = null;

      const handleMouseEnter = () => { isPaused = true; };
      const handleMouseLeave = () => { isPaused = false; };
      const handleTouchStart = () => { isPaused = true; };
      const handleTouchEnd = () => {
        setTimeout(() => {
          isPaused = false;
        }, 2500);
      };

      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
      el.addEventListener('touchstart', handleTouchStart);
      el.addEventListener('touchend', handleTouchEnd);

      // Lazy cache for scrollability: only scroll if it actually has overflow
      let isScrollable = false;
      const updateScrollableState = () => {
        if (el) {
          isScrollable = el.scrollWidth > el.clientWidth;
        }
      };
      
      // Check initially after render and on resize
      setTimeout(updateScrollableState, 150);
      window.addEventListener('resize', updateScrollableState);

      intervalId = setInterval(() => {
        if (isPaused || !isScrollable) return;

        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return;

        if (el.scrollLeft >= maxScroll - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const cardWidth = el.firstElementChild ? el.firstElementChild.clientWidth + 20 : 300;
          el.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }, 5000); // More elegant interval (5s instead of 3.5s) to reduce CPU load

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('resize', updateScrollableState);
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchend', handleTouchEnd);
      };
    };

    const cleanup1 = setupAutoScroll(couponsRef);
    const cleanup1b = setupAutoScroll(categoryRef);
    const cleanup2 = setupAutoScroll(trustRef);
    const cleanup3 = setupAutoScroll(newArrivalsRef);
    const cleanup4 = setupAutoScroll(bestSellersRef);
    const cleanup5 = setupAutoScroll(trendingRef);
    const cleanup6 = setupAutoScroll(reviewsRef);
    const cleanup7 = setupAutoScroll(instagramRef);
    const cleanup8 = setupAutoScroll(whyChooseRef);

    return () => {
      cleanup1 && cleanup1();
      cleanup1b && cleanup1b();
      cleanup2 && cleanup2();
      cleanup3 && cleanup3();
      cleanup4 && cleanup4();
      cleanup5 && cleanup5();
      cleanup6 && cleanup6();
      cleanup7 && cleanup7();
      cleanup8 && cleanup8();
    };
  }, [products.length]);

  // Hero Slides
  const heroSlides = useMemo(() => [
    {
      image: siteSettings.heroImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
      title: siteSettings.heroTitle || 'Anti-Tarnish Elegance',
      subtitle: siteSettings.heroSubtitle || 'Premium 18k Rolled Gold',
      desc: siteSettings.heroDescription || 'Beautifully crafted jewelry micro-plated with a tarnish-resistant polymer seal. Designed for daily wear, sweat, and showers.'
    },
    {
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80',
      title: 'Everyday Hair Aesthetics',
      subtitle: 'Silk Scrunchies & Metallic Clutchers',
      desc: 'Protect your hair health while maintaining a high-fashion look. Our mulberry silk scrunchies minimize breakage.'
    },
    {
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80',
      title: 'Kashmiri Jhumke & Payals',
      subtitle: 'Traditional Royal Splendor',
      desc: 'Enchanting ethnic statements micro-plated in rich gold tones, bringing timeless Indian heritage straight to your collection.'
    }
  ], [siteSettings.heroImage, siteSettings.heroTitle, siteSettings.heroSubtitle, siteSettings.heroDescription]);

  // Auto-rotate hero slider
  useEffect(() => {
    heroTimerRef.current = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, [heroSlides.length]);

  const goToSlide = (idx: number) => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    setActiveSlide(idx);
    heroTimerRef.current = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
  };

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0
        ? (activeSlide + 1) % heroSlides.length
        : (activeSlide - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  const handleHeroKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      goToSlide((activeSlide + 1) % heroSlides.length);
    } else if (e.key === 'ArrowLeft') {
      goToSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  const categories = siteSettings.homeCategories && siteSettings.homeCategories.length > 0
    ? siteSettings.homeCategories.map(c => ({ id: c.id, name: c.name, desc: c.desc, image: c.image }))
    : defaultCategories;

  // Filtering products — use admin-selected IDs or fall back to defaults
  const newArrivals = siteSettings.homeNewArrivals.length > 0
    ? siteSettings.homeNewArrivals.map(id => products.find(p => p.id === id)).filter(Boolean) as typeof products
    : products;
  const bestSellers = siteSettings.homeBestSellers.length > 0
    ? siteSettings.homeBestSellers.map(id => products.find(p => p.id === id)).filter(Boolean) as typeof products
    : products.filter(p => p.rating >= 4.8);
  const trending = siteSettings.homeTrending.length > 0
    ? siteSettings.homeTrending.map(id => products.find(p => p.id === id)).filter(Boolean) as typeof products
    : products.slice(3);

  // Copy coupon handler
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleCategoryClick = (catId: string) => {
    setShopCategory(catId);
    navigate('/shop');
  };

  return (
    <div className="home-page" style={{ display: 'flex', flexDirection: 'column', gap: '52px', position: 'relative' }}>
      
      {/* 1. HERO SLIDER */}
      <div 
        style={{ 
          position: 'relative', 
          height: '75vh', 
          width: '94%', 
          maxWidth: '1360px',
          margin: '20px auto 0',
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
          outline: 'none'
        }}
        className="hero-slider-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleHeroKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Hero carousel"
        aria-live="polite"
        aria-roledescription="carousel"
      >
        {heroSlides.map((slide, index) => {
          const isActive = index === activeSlide;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: isActive ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out',
                zIndex: isActive ? 1 : 0
              }}
            >
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `linear-gradient(rgba(15, 15, 18, 0.3) 0%, rgba(15, 15, 18, 0.75) 100%), url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '8%',
                  transform: 'translateY(-50%)',
                  maxWidth: '600px',
                  zIndex: 2,
                  animation: 'slideUpText 0.8s ease-out'
                }}>
                  <span style={{ color: '#bfa575', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.2em', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                    {slide.subtitle}
                  </span>
                  <span style={{ display: 'block', fontSize: '3.5rem', fontFamily: 'var(--font-serif)', lineHeight: '1.1', marginBottom: '20px', color: '#ffffff', fontWeight: 300 }}>
                    {slide.title}
                  </span>
                  <p style={{ color: '#e5e0d8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
                    {slide.desc}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      onClick={() => { setShopCategory('all'); navigate('/shop'); }}
                      className="gold-button"
                      style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                      Shop Collections <ArrowRight size={16} />
                    </button>
                    <button 
                      onClick={() => navigate('/about')}
                      className="gold-button-outline"
                      style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)', background: 'transparent' }}
                    >
                      Our Story
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Diamond Pagination Indicators */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '14px',
          zIndex: 10
        }}>
          {heroSlides.map((_, idx) => {
            const isActive = idx === activeSlide;
            return (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                title={`Go to slide ${idx + 1}`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span style={{
                  width: '7px',
                  height: '7px',
                  backgroundColor: isActive ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.45)',
                  border: 'none',
                  transform: 'rotate(45deg)',
                  transition: 'all 0.3s ease',
                  display: 'block'
                }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TRUST ELEMENTS */}
      {!isMobile && (
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div ref={trustRef} className="glass trust-carousel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
          <div>
            <div style={{ color: 'var(--gold-primary)', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}><ShieldCheck size={28} /></div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>100% Anti-Tarnish</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Sweatproof, waterproof organic coating</p>
          </div>
          <div>
            <div style={{ color: 'var(--gold-primary)', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}><Truck size={28} /></div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>Fast Shipping India</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Express courier delivery via Shiprocket</p>
          </div>
          <div>
            <div style={{ color: 'var(--gold-primary)', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}><Award size={28} /></div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>Hypoallergenic & Skin-Safe</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Nickel-free brass & stainless steel bases</p>
          </div>
          <div>
            <div style={{ color: 'var(--gold-primary)', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}><MessageSquare size={28} /></div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>Genuine Support</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>24/7 dedicated WhatsApp support desk</p>
          </div>
        </div>
      </div>
      )}

      {/* 3. SHOP BY CATEGORY */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Curated Aesthetics</span>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginTop: '8px', color: 'var(--text-primary)', fontWeight: 300 }}>Shop By Category</h2>
        </div>

        <div ref={categoryRef} className="category-scroll-mobile">
          {(() => {
            const pages = [];
            for (let i = 0; i < categories.length; i += 4) {
              pages.push(categories.slice(i, i + 4));
            }
            return pages.map((page, pageIdx) => (
              <div key={pageIdx} className="category-page">
                {page.map((cat) => (
                  <div 
                    key={cat.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCategoryClick(cat.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryClick(cat.id); } }}
                    className="glass category-card"
                    style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      position: 'relative',
                      height: '240px',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div 
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(to top, rgba(15,15,18,0.9) 0%, rgba(15,15,18,0.2) 100%), url(${cat.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
                      <h3 style={{ color: '#ffffff', fontSize: '1.2rem', margin: 0, fontWeight: 500 }}>{cat.name}</h3>
                      <p style={{ color: '#e0e0e0', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{cat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* 4. DYNAMIC OFFERS & COUPONS — Auto-sliding carousel */}
      {coupons && coupons.filter(c => c.active).length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Limited Time Perks</span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginTop: '8px', color: 'var(--text-primary)', fontWeight: 300 }}>Exclusive Offers & Coupons</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>Copy a code below and apply it at checkout</p>
          </div>

          <div
            ref={couponsRef}
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              padding: '8px 4px 20px',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
            className="coupon-carousel"
          >
            {coupons.filter(c => c.active).map((c) => (
              <div
                key={c.code}
                className="glass coupon-card"
                style={{
                  minWidth: '320px',
                  maxWidth: '360px',
                  scrollSnapAlign: 'center',
                  padding: '28px 24px',
                  borderRadius: '12px',
                  borderLeft: '5px solid var(--gold-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'linear-gradient(135deg, #fff 0%, var(--gold-light) 100%)',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'var(--gold-primary)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {c.type === 'fixed' ? `₹${c.value} OFF` : `${c.value}% OFF`}
                  </span>
                  {c.minOrder > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Min. order ₹{c.minOrder.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0, fontWeight: 600, lineHeight: 1.3 }}>
                  {c.description || (c.type === 'fixed' ? `Flat ₹${c.value} off your order` : `${c.value}% discount on your order`)}
                </h3>

                {c.minOrder > 0 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                    {c.minOrder > subtotal
                      ? `Add ₹${(c.minOrder - subtotal).toLocaleString('en-IN')} more to unlock this offer`
                      : 'Your cart qualifies for this offer!'
                    }
                  </p>
                )}

                <button
                  onClick={() => handleCopyCoupon(c.code)}
                  style={{
                    marginTop: '4px',
                    background: '#fff',
                    border: '2px dashed var(--gold-primary)',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'var(--gold-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copiedCoupon === c.code ? (
                    <>
                      <Check size={16} style={{ color: '#2ecc71' }} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Clipboard size={16} />
                      {c.code}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. NEW ARRIVALS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Just Added</span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginTop: '8px', color: 'var(--text-primary)', fontWeight: 300 }}>New Arrivals</h2>
          </div>
          <button onClick={() => { setShopCategory('all'); navigate('/shop'); }} style={{ color: 'var(--gold-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div ref={newArrivalsRef} className="home-product-carousel" style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* 6. BEST SELLERS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Customer Favorites</span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginTop: '8px', color: 'var(--text-primary)', fontWeight: 300 }}>Best Sellers</h2>
          </div>
          <button onClick={() => { setShopCategory('all'); navigate('/shop'); }} style={{ color: 'var(--gold-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div ref={bestSellersRef} className="home-product-carousel" style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} showRating />
          ))}
        </div>
      </div>

      {/* 6.5. TRENDING COLLECTION */}
      <div style={{ maxWidth: '1200px', margin: '28px auto', width: '100%', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Viral on Socials</span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginTop: '8px', color: 'var(--text-primary)', fontWeight: 300 }}>Trending</h2>
          </div>
          <button onClick={() => { setShopCategory('all'); navigate('/shop'); }} style={{ color: 'var(--gold-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div ref={trendingRef} className="home-product-carousel" style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {trending.map((prod) => (
            <ProductCard key={prod.id} product={prod} badge={{ label: '🔥 TRENDING', color: 'rgba(131,39,41,0.88)' }} />
          ))}
        </div>
      </div>

      {/* 7. WHY CHOOSE MAA DIARIES */}
      <div style={{ background: 'var(--bg-secondary)', padding: '56px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Uncompromised Quality</span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginTop: '8px', color: 'var(--text-primary)', fontWeight: 300 }}>Why Choose Maa Diaries?</h2>
          </div>

          <div ref={whyChooseRef} className="why-choose-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="glass" style={{ padding: '30px', borderRadius: '6px' }}>
              <div style={{ color: 'var(--gold-primary)', marginBottom: '16px' }}><Heart size={28} /></div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '12px', fontWeight: 500 }}>Heritage-Inspired Designs</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Celebrating India's rich culture and divine grace. Our collections are inspired by traditional motifs, bringing a touch of history and timeless beauty to modern ensembles.
              </p>
            </div>
            <div className="glass" style={{ padding: '30px', borderRadius: '6px' }}>
              <div style={{ color: 'var(--gold-primary)', marginBottom: '16px' }}><Award size={28} /></div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '12px', fontWeight: 500 }}>Handcrafted with Love</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Designed and crafted by local Indian artisans. Every piece is meticulously handmade with a focus on purity, authentic aesthetics, and exceptional attention to detail.
              </p>
            </div>
            <div className="glass" style={{ padding: '30px', borderRadius: '6px' }}>
              <div style={{ color: 'var(--gold-primary)', marginBottom: '16px' }}><ShieldCheck size={28} /></div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '12px', fontWeight: 500 }}>Premium Anti-Tarnish Polish</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Crafted with 18k micro-rolled-gold plating over a skin-safe base. Fully water-resistant and hypoallergenic, ensuring long-lasting lustre for everyday wear.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8. CUSTOMER REVIEWS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Hear from our clients</span>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginTop: '8px', color: 'var(--text-primary)', fontWeight: 300 }}>Customer Reviews</h2>
        </div>

        <div ref={reviewsRef} className="product-grid-scroll reviews-carousel" style={{ display: 'flex', gap: '20px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '8px', scrollbarWidth: 'none', paddingInline: 'calc(50% - 250px)' }}>
          {[
            { name: 'Aishwarya R.', city: 'Mumbai', text: 'Stunning anti-tarnish payals! I was skeptical but I have been wearing them daily in the shower and there is zero change in shine. Absolutely love Maa Diaries.', rating: 5 },
            { name: 'Megha S.', city: 'Delhi', text: 'The metal clutchers are so strong and hold my thick hair perfectly. The rose theme packaging felt incredibly premium and luxury. Will buy again!', rating: 5 },
            { name: 'Kavita J.', city: 'Bangalore', text: 'Highly recommend the Kashmiri Jhumke. Heavy details but extremely lightweight on the ears. Hypoallergenic claim is true—no itchiness at all!', rating: 5 }
          ].map((rev, idx) => (
            <div key={idx} className="glass" style={{ flex: '0 0 500px', minWidth: '280px', maxWidth: '500px', scrollSnapAlign: 'center', padding: '30px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#f1c40f' }}>
                {[...Array(rev.rating)].map((_, i) => <Star key={i} size={16} fill="#f1c40f" />)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{rev.text}"
              </p>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0 }}>{rev.name}</h4>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{rev.city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. INSTAGRAM SOCIAL FEED */}
      {siteSettings.instagramFeedUrls.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Join the community</span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginTop: '8px', color: 'var(--text-primary)', fontWeight: 300 }}>Instagram Social Feed</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Follow us on <a href="https://www.instagram.com/maadiaries_?igsh=MTkxNGlydGhscXR6aA==" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-primary)', fontWeight: 500, textDecoration: 'underline' }}>@maadiaries_</a>
            </p>
          </div>

          <div ref={instagramRef} className="product-grid-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {siteSettings.instagramFeedUrls.sort((a, b) => a.sortOrder - b.sortOrder).map((feed) => (
              <a 
                key={feed.url}
                href={feed.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (feed.type === 'reel') {
                    e.preventDefault();
                    setIgModalUrl(feed.url);
                  }
                }}
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                  height: '280px',
                  cursor: 'pointer',
                  display: 'block',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  border: '1px solid var(--border-light)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector('.insta-overlay') as HTMLDivElement;
                  if (overlay) overlay.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector('.insta-overlay') as HTMLDivElement;
                  if (overlay) overlay.style.opacity = '0';
                }}
              >
                {/* Type Badge */}
                <div style={{
                  position: 'absolute', top: '12px', left: '12px', zIndex: 10,
                  background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                  color: '#ffffff', padding: '4px 10px', borderRadius: '12px',
                  fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  {feed.type === 'reel' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(0.5px)' }}>
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <line x1="15" y1="3" x2="15" y2="21"></line>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="21" y2="15"></line>
                    </svg>
                  )}
                  {feed.type === 'reel' ? 'Reel' : 'Post'}
                </div>

                {/* Image */}
                <div style={{
                  width: '100%', height: '100%',
                  backgroundImage: `url(${feed.thumbnail || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80'})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  transition: 'transform 0.5s ease'
                }} />

                {/* Hover Overlay */}
                <div className="insta-overlay" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(131, 39, 41, 0.85)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '20px', opacity: 0, transition: 'opacity 0.3s ease',
                  color: '#ffffff', textAlign: 'center'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '14px' }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  {feed.title && (
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '0 0 16px', lineHeight: 1.4 }}>
                      "{feed.title}"
                    </p>
                  )}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {feed.type === 'reel' ? 'Watch Reel' : 'View Post'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Instagram Reel Modal */}
      {igModalUrl && (
        <div
          onClick={() => setIgModalUrl(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', cursor: 'pointer'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#000', borderRadius: '12px', overflow: 'hidden',
              width: '100%', maxWidth: '420px', maxHeight: '85vh',
              position: 'relative', cursor: 'default'
            }}
          >
            <button
              onClick={() => setIgModalUrl(null)}
              style={{
                position: 'absolute', top: '8px', right: '8px', zIndex: 10,
                background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                width: '32px', height: '32px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem'
              }}
            >
              ✕
            </button>
            <div style={{ width: '100%', paddingBottom: '120%', position: 'relative' }}>
              <iframe
                src={`${igModalUrl}embed/`}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  border: 'none'
                }}
                allowFullScreen
                title="Instagram Reel"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
