import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { GemRainCanvas } from './components/GemRainCanvas';
import { MotionEnhancer } from './components/MotionEnhancer';
import { CartFlyEffect } from './components/CartFlyEffect';
import { GlobalEffects } from './components/GlobalEffects';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieConsent } from './components/CookieConsent';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const AdminPortal = lazy(() => import('./pages/AdminPortal').then(m => ({ default: m.AdminPortal })));
const AboutUs = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const ContactUs = lazy(() => import('./pages/ContactUs').then(m => ({ default: m.ContactUs })));
const FAQs = lazy(() => import('./pages/FAQs').then(m => ({ default: m.FAQs })));
const MyAccount = lazy(() => import('./pages/MyAccount').then(m => ({ default: m.MyAccount })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '12px',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
      letterSpacing: '0.05em'
    }}>
      <div className="luxury-loader" style={{ borderTopColor: 'var(--gold-primary)', width: '32px', height: '32px' }} />
      Loading...
    </div>
  );
}

function FloatingWhatsApp() {
  const { siteSettings } = useStore();
  if (!siteSettings.whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent('Hi! I have a question about your jewelry.')}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D366',
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#ffffff">
        <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.415 1.258 4.864L2.03 22.03l5.312-1.393c1.4.76 2.99 1.196 4.67 1.196 5.505 0 9.988-4.482 9.988-9.988S17.518 2 12.01 2zm4.767 14.286c-.2.56-1.18 1.08-1.63 1.13-.43.05-.98.24-2.88-.54-2.44-1-4.01-3.49-4.13-3.65-.12-.15-.99-1.31-.99-2.5 0-1.19.62-1.78.84-2.02.2-.24.45-.3.6-.3.15 0 .3 0 .44.01.15.01.35-.06.55.42.2.49.69 1.68.75 1.8.06.12.1.27.02.43-.08.16-.18.27-.3.41-.12.14-.26.31-.37.42-.12.13-.25.27-.11.51.14.24.62 1.01 1.32 1.63.9.79 1.66 1.04 1.89 1.16.24.12.38.1.52-.06.14-.17.6-.7 1.12-.95.19-.09.38-.08.57 0 .2.08 1.25.59 1.46.7.2.1.34.15.39.24.06.09.06.52-.14 1.08z"/>
      </svg>
    </a>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  return (
    <div className="app-container">
      <ScrollToTop />
      <a href="#main-content" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} onFocus={e => { e.currentTarget.style.position = 'fixed'; e.currentTarget.style.left = '16px'; e.currentTarget.style.top = '16px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.height = 'auto'; e.currentTarget.style.overflow = 'visible'; e.currentTarget.style.zIndex = '99999'; e.currentTarget.style.background = 'var(--gold-primary)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.padding = '12px 24px'; e.currentTarget.style.borderRadius = '6px'; e.currentTarget.style.fontSize = '0.9rem'; e.currentTarget.style.fontWeight = '600'; e.currentTarget.style.textDecoration = 'none'; }}>
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" style={{ flex: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:category" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faq" element={<FAQs />} />
              <Route path="/account" element={<MyAccount />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />

      <CartDrawer />
      <CheckoutModal />
      <GemRainCanvas />
      <MotionEnhancer />
      <CartFlyEffect />
      <GlobalEffects />
      <CookieConsent />
      <FloatingWhatsApp />
    </div>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (currentUser?.email === 'founder@maadiaries.com') {
      setIsAdmin(true);
      setLoading(false);
    } else if (currentUser) {
      setIsAdmin(false);
      setLoading(false);
    } else {
      const checkSession = async () => {
        const { isSupabaseConfigured, supabase } = await import('./services/supabase');
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user?.email === 'founder@maadiaries.com') {
            setIsAdmin(true);
            setLoading(false);
            return;
          }
        }
        setIsAdmin(false);
        setLoading(false);
      };
      checkSession();
    }
  }, [currentUser]);

  if (loading) {
    return <PageLoader />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <ToastProvider>
          <Routes>
            <Route path="/admin" element={
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <AdminRoute>
                    <AdminPortal />
                  </AdminRoute>
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </ToastProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
