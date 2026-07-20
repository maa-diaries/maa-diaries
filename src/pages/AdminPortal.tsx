import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { databaseService } from '../services/database';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { couponsService, type Coupon } from '../services/coupons';
import { siteSettingsService, type SiteSettings } from '../services/siteSettings';
import type { Order } from '../services/database';
import type { Product } from '../data/products';
import { 
  Lock, Trash2, Edit3, Plus, Package, Clock, DollarSign, 
  Eye, X, Check, Truck, CreditCard, Settings, Upload, Percent,
  XCircle, Star, MessageSquare
} from 'lucide-react';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'payments' | 'settings' | 'low-reviews';

const SAMPLE_JEWELRY_IMAGES = [
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80'
];

export const AdminPortal: React.FC = () => {
  const { 
    products, 
    refreshProducts, 
    orders, 
    refreshOrders,
    categories,
    addCategory,
    deleteCategory,
    resetAndSeedProducts
  } = useStore();

  const availableCategories = categories;

  const [pin, setPin] = useState(''); // retained only while the legacy keypad is hidden below
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Search & Filter state for catalog list
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');

  // Search & Filter state for orders list
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const [newCatInput, setNewCatInput] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinOrder, setCouponMinOrder] = useState(0);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => siteSettingsService.get());

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Product Form Fields
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<string>('earrings');
  const [prodOriginalPrice, setProdOriginalPrice] = useState(0);
  const [prodDiscount, setProdDiscount] = useState(0);
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodSku, setProdSku] = useState('');
  const [prodImage, setProdImage] = useState(SAMPLE_JEWELRY_IMAGES[0]);
  const [prodDesc, setProdDesc] = useState('');
  const [prodPlating, setProdPlating] = useState('18k Rolled Gold Micro-Plating');
  const [prodTarnish, setProdTarnish] = useState('Organic Electro-Coating Seal (Waterproof)');
  const [specBaseMetal, setSpecBaseMetal] = useState('Hypoallergenic Lead-Free Brass');
  const [specCoatingThickness, setSpecCoatingThickness] = useState('2.5 Microns');
  const [specWeight, setSpecWeight] = useState('4.8 grams');
  const [specWaterproof, setSpecWaterproof] = useState('Yes (Shower & Sweat Proof)');

  // Order inspection detail modal
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [modalTrackingNum, setModalTrackingNum] = useState('');
  const [modalEstDelivery, setModalEstDelivery] = useState('');

  // Low Reviews (under 3 stars only)
  const [lowReviews, setLowReviews] = useState<any[]>([]);

  const loadLowReviews = async () => {
    try {
      const allReviews = await databaseService.getAllReviews();
      // Filter reviews under 3 stars only (<= 3)
      const filtered = allReviews.filter(r => Number(r.rating) <= 3);
      setLowReviews(filtered);
    } catch (err) {
      console.warn("Failed to load reviews:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLowReviews();
    }
  }, [isAuthenticated, products]);

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await databaseService.deleteProductReview(reviewId);
        loadLowReviews();
      } catch (err) {
        console.error("Failed to delete review:", err);
      }
    }
  };

  // No passcode is shipped to the browser; the owner signs in with Supabase Auth.
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (!isSupabaseConfigured) {
      setPinError('Admin authentication needs Supabase configuration.');
      return;
    }
    setIsPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail.trim(), password: adminPassword });
    setIsPending(false);
    if (!error) {
      setIsAuthenticated(true);
    } else {
      setPinError('Unable to sign in. Check your admin email and password.');
    }
  };

  // Legacy keypad handlers remain only for the hidden compatibility markup.
  const handleKeyPress = (num: string) => setPin(prev => `${prev}${num}`.slice(0, 4));
  const handleClear = () => setPin('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }: any) => setIsAuthenticated(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => setIsAuthenticated(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (isAuthenticated) setCoupons(couponsService.list()); }, [isAuthenticated]);
  const saveCoupons = (next: Coupon[]) => { setCoupons(next); couponsService.save(next); };
  const addCoupon = (e: React.FormEvent) => { e.preventDefault(); const code = couponCode.trim().toUpperCase(); if (!code) return; if (coupons.some(c => c.code === code)) { alert('This coupon code already exists.'); return; } saveCoupons([...coupons, { code, type: 'percent', value: couponValue, minOrder: couponMinOrder, active: true }]); setCouponCode(''); setCouponValue(10); setCouponMinOrder(0); };

  // Mock upload simulator
  const triggerMockUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const randomUrl = SAMPLE_JEWELRY_IMAGES[Math.floor(Math.random() * SAMPLE_JEWELRY_IMAGES.length)];
      setProdImage(randomUrl);
      setIsUploading(false);
    }, 700);
  };

  // Auto calculate sale price when original price or discount changes
  const handleOriginalPriceChange = (val: number) => {
    setProdOriginalPrice(val);
    if (prodDiscount > 0) {
      setProdPrice(Math.round(val * (1 - prodDiscount / 100)));
    } else {
      setProdPrice(val);
    }
  };

  const handleDiscountChange = (val: number) => {
    setProdDiscount(val);
    if (prodOriginalPrice > 0) {
      setProdPrice(Math.round(prodOriginalPrice * (1 - val / 100)));
    }
  };

  // --- CRUD Operations ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const newProductData = {
        name: prodName,
        description: prodDesc,
        category: prodCategory,
        price: prodPrice,
        originalPrice: prodOriginalPrice || prodPrice,
        discount: prodDiscount || 0,
        stock: prodStock,
        sku: prodSku || undefined,
        rating: 5.0,
        reviewsCount: 0,
        image: prodImage,
        metalOptions: [prodPlating],
        stoneOptions: [prodTarnish],
        specs: {
          metal: specBaseMetal,
          coating: specCoatingThickness,
          stoneType: specWeight,
          durability: specWaterproof,
          finish: 'Handcrafted Premium'
        }
      };

      await databaseService.addProduct(newProductData);
      await refreshProducts();
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add product:", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsPending(true);

    try {
      const updated: Product = {
        ...editingProduct,
        name: prodName,
        description: prodDesc,
        category: prodCategory,
        price: prodPrice,
        originalPrice: prodOriginalPrice || prodPrice,
        discount: prodDiscount || 0,
        stock: prodStock,
        sku: prodSku || undefined,
        image: prodImage,
        metalOptions: [prodPlating],
        stoneOptions: [prodTarnish],
        specs: {
          metal: specBaseMetal,
          coating: specCoatingThickness,
          stoneType: specWeight,
          durability: specWaterproof,
          finish: editingProduct.specs.finish || 'Handcrafted Premium'
        }
      };

      await databaseService.updateProduct(updated);
      await refreshProducts();
      resetForm();
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to update product:", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this jewelry item from the active inventory?')) {
      setIsPending(true);
      try {
        await databaseService.deleteProduct(id);
        await refreshProducts();
      } catch (err) {
        console.error("Failed to delete product:", err);
      } finally {
        setIsPending(false);
      }
    }
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdOriginalPrice(p.originalPrice || p.price);
    setProdDiscount(p.discount || 0);
    setProdPrice(p.price);
    setProdStock(p.stock ?? 0);
    setProdSku(p.sku || '');
    setProdImage(p.image);
    setProdDesc(p.description);
    setProdPlating(p.metalOptions[0] || '');
    setProdTarnish(p.stoneOptions[0] || '');
    setSpecBaseMetal(p.specs.metal);
    setSpecCoatingThickness(p.specs.coating || '');
    setSpecWeight(p.specs.stoneType);
    setSpecWaterproof(p.specs.durability);
  };

  const resetForm = () => {
    setProdName('');
    setProdCategory('earrings');
    setProdOriginalPrice(0);
    setProdDiscount(0);
    setProdPrice(0);
    setProdStock(0);
    setProdSku('');
    setProdImage(SAMPLE_JEWELRY_IMAGES[0]);
    setProdDesc('');
    setProdPlating('18k Rolled Gold Micro-Plating');
    setProdTarnish('Organic Electro-Coating Seal (Waterproof)');
    setSpecBaseMetal('Hypoallergenic Lead-Free Brass');
    setSpecCoatingThickness('2.5 Microns');
    setSpecWeight('4.8 grams');
    setSpecWaterproof('Yes (Shower & Sweat Proof)');
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    setIsPending(true);
    try {
      await databaseService.updateOrderStatus(orderId, status);
      await refreshOrders();
      if (inspectingOrder && inspectingOrder.id === orderId) {
        setInspectingOrder(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdatePayment = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    setIsPending(true);
    try {
      await databaseService.updateOrderPaymentStatus(orderId, paymentStatus);
      await refreshOrders();
      if (inspectingOrder && inspectingOrder.id === orderId) {
        setInspectingOrder(prev => prev ? { ...prev, paymentStatus } : null);
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleSaveShippingDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingOrder) return;
    setIsPending(true);
    try {
      await databaseService.updateOrderTrackingAndDelivery(
        inspectingOrder.id,
        modalTrackingNum,
        modalEstDelivery
      );
      await refreshOrders();
      setInspectingOrder(prev => prev ? {
        ...prev,
        trackingNumber: modalTrackingNum || undefined,
        estimatedDelivery: modalEstDelivery
      } : null);
      alert('Order shipment courier details updated successfully!');
    } catch (err) {
      console.error("Failed to update shipping details:", err);
    } finally {
      setIsPending(false);
    }
  };

  // Open inspection modal
  const openInspectModal = (order: Order) => {
    setInspectingOrder(order);
    setModalTrackingNum(order.trackingNumber || '');
    setModalEstDelivery(order.estimatedDelivery || '');
  };

  // Add Dynamic Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatInput.trim() && !availableCategories.includes(newCatInput.trim().toLowerCase())) {
      await addCategory(newCatInput.trim().toLowerCase());
      setNewCatInput('');
      alert('New category successfully saved to database.');
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    const productsInCat = products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
    if (productsInCat.length > 0) {
      alert(`Cannot delete category "${catName}" because it is currently used by ${productsInCat.length} product(s). Please reassign or delete those products first.`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
      await deleteCategory(catName);
    }
  };

  const [isResettingProducts, setIsResettingProducts] = useState(false);
  const handleResetProducts = async () => {
    if (window.confirm("WARNING: This will delete ALL current products in the database and re-seed the default catalog with exactly 4 products per category (28 products total). This action cannot be undone. Are you sure you want to proceed?")) {
      setIsResettingProducts(true);
      try {
        await resetAndSeedProducts();
        alert("Success! Catalog successfully reset and seeded with 4 products per category.");
      } catch (err: any) {
        alert("Failed to reset products: " + (err.message || err));
      } finally {
        setIsResettingProducts(false);
      }
    }
  };

  // --- Analytical Aggregations ---
  const revenue = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;

  // COD & Online payments calculations
  const codOrders = orders.filter(o => o.paymentMethod === 'COD');
  const codCount = codOrders.length;
  const codAmount = codOrders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);

  const onlineOrders = orders.filter(o => o.paymentMethod === 'Online');
  const onlineCount = onlineOrders.length;
  const onlineAmount = onlineOrders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);

  // Group orders by customer phone/email to compile customer records
  const getCustomersList = () => {
    const customerMap: Record<string, {
      name: string;
      phone: string;
      email: string;
      address: string;
      ordersCount: number;
      totalSpent: number;
      orderIds: string[];
    }> = {};

    orders.forEach(o => {
      const key = o.customerPhone || o.customerEmail;
      if (!key) return;

      if (!customerMap[key]) {
        customerMap[key] = {
          name: o.customerName,
          phone: o.customerPhone,
          email: o.customerEmail,
          address: `${o.addressLine}, ${o.city}, ${o.state} - ${o.pincode}`,
          ordersCount: 0,
          totalSpent: 0,
          orderIds: []
        };
      }

      const client = customerMap[key];
      client.ordersCount += 1;
      if (o.status !== 'Cancelled') {
        client.totalSpent += o.totalAmount;
      }
      if (!client.orderIds.includes(o.id)) {
        client.orderIds.push(o.id);
      }
    });

    return Object.values(customerMap);
  };

  const customersList = getCustomersList();

  if (!isAuthenticated) {
    return (
      <div style={{
        maxWidth: '420px',
        margin: '100px auto',
        padding: '24px',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <form onSubmit={handlePinSubmit} className="glass" style={{
          padding: '40px 32px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 20px 40px rgba(131, 39, 41, 0.05)'
        }}>
          <div style={{
            backgroundColor: 'var(--gold-light)',
            padding: '16px',
            borderRadius: '50%',
            color: 'var(--gold-primary)'
          }}>
            <Lock size={28} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              Maa Diaries Vault Controls
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Sign in with the dedicated Supabase admin account.
            </p>
          </div>

          <div style={{
            letterSpacing: '10px',
            fontSize: '1.8rem',
            fontFamily: 'monospace',
            color: 'var(--gold-primary)',
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px 24px',
            borderRadius: '8px',
            width: '160px',
            textAlign: 'center',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-light)',
            fontWeight: 'bold'
          }}>
            {'•'.repeat(pin.length) || (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: 'normal' }}>
                Enter PIN
              </span>
            )}
          </div>

          {pinError && <span style={{ fontSize: '0.78rem', color: '#832729', fontWeight: 500 }}>{pinError}</span>}

          <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Admin email" autoComplete="email" required style={{ width: '100%', padding: '13px', border: '1px solid var(--border-light)', borderRadius: '7px', background: 'var(--bg-secondary)' }} />
          <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required style={{ width: '100%', padding: '13px', border: '1px solid var(--border-light)', borderRadius: '7px', background: 'var(--bg-secondary)' }} />

          {/* Keypad */}
          <div style={{
            display: 'none',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            width: '100%'
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                className="pin-btn"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '14px',
                backgroundColor: 'rgba(131, 39, 41, 0.05)',
                border: '1px solid rgba(131, 39, 41, 0.12)',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: 'var(--gold-primary)',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              style={{
                padding: '14px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                fontSize: '1.1rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              className="pin-btn"
            >
              0
            </button>
            <button
              type="submit"
              style={{
                padding: '14px',
                backgroundColor: 'var(--gold-primary)',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'var(--transition-fast)'
              }}
            >
              Enter
            </button>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Use the single secure owner account configured in Supabase Auth.</span>
        </form>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '0 24px',
      minHeight: '80vh',
      position: 'relative'
    }}>
      {/* Pending Loader overlay */}
      {isPending && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div className="luxury-loader" style={{ borderTopColor: 'var(--gold-primary)', width: '50px', height: '50px' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, letterSpacing: '0.05em' }}>
            SYNCING DATABASE VAULT...
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 300 }}>Maa Diaries Vault Controls</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Global Production Admin Panel</span>
        </div>
        <button 
          onClick={async () => { await supabase.auth.signOut(); setIsAuthenticated(false); }}
          className="gold-button-outline"
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
        >
          Lock Console
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '32px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {([
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'products', label: 'Products' },
          { id: 'orders', label: 'Orders' },
          { id: 'customers', label: 'Customers' },
          { id: 'payments', label: 'Payments' },
          { id: 'low-reviews', label: `Reviews (≤ 3★) ${lowReviews.length > 0 ? `(${lowReviews.length})` : ''}` },
          { id: 'settings', label: 'Settings' }
        ] as any[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderBottom: activeTab === tab.id ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--gold-primary)' : 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              transition: 'var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ backgroundColor: 'var(--gold-light)', padding: '12px', borderRadius: '50%', color: 'var(--gold-primary)' }}>
                <Percent size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Products</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{products.length} Items</h4>
              </div>
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.06)', padding: '12px', borderRadius: '50%', color: '#3498db' }}>
                <Package size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Orders</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{orders.length} Placed</h4>
              </div>
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.06)', padding: '12px', borderRadius: '50%', color: '#f1c40f' }}>
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pending Orders</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{pendingOrdersCount} Wait</h4>
              </div>
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.06)', padding: '12px', borderRadius: '50%', color: '#2ecc71' }}>
                <Check size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Delivered Orders</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{deliveredOrdersCount} Done</h4>
              </div>
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ backgroundColor: 'rgba(231, 76, 60, 0.06)', padding: '12px', borderRadius: '50%', color: '#e74c3c' }}>
                <XCircle size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Cancelled Orders</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{cancelledOrdersCount} Items</h4>
              </div>
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ backgroundColor: 'rgba(131, 39, 41, 0.08)', padding: '12px', borderRadius: '50%', color: 'var(--gold-primary)' }}>
                <DollarSign size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Revenue</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>₹ {revenue.toLocaleString('en-IN')}</h4>
              </div>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>
              Recent Orders Feed
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Order ID</th>
                    <th style={{ padding: '12px' }}>Customer</th>
                    <th style={{ padding: '12px' }}>Total</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{o.id}</td>
                      <td style={{ padding: '12px' }}>{o.customerName}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--gold-primary)' }}>₹ {o.totalAmount}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: o.status === 'Delivered' ? 'rgba(46, 204, 113, 0.08)' : o.status === 'Cancelled' ? 'rgba(231, 76, 60, 0.08)' : 'rgba(241, 196, 15, 0.08)',
                          color: o.status === 'Delivered' ? '#27ae60' : o.status === 'Cancelled' ? '#c0392b' : '#d35400'
                        }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.8rem' }}>{o.paymentMethod}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders placed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!showAddForm && !editingProduct && (
            <button 
              onClick={() => { resetForm(); setShowAddForm(true); }}
              className="gold-button"
              style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px', padding: '10px 20px', fontSize: '0.8rem' }}
            >
              <Plus size={16} /> Add Product
            </button>
          )}

          {(showAddForm || editingProduct) && (
            <form 
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              className="glass" 
              style={{
                padding: '32px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add Product'}
                </h3>
                <button 
                  type="button" 
                  onClick={() => { setEditingProduct(null); setShowAddForm(false); resetForm(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={prodName} 
                    onChange={e => setProdName(e.target.value)} 
                    placeholder="Classic Solitaire Ring" 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Category</label>
                  <select 
                    value={prodCategory} 
                    onChange={e => setProdCategory(e.target.value)}
                    style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '12px', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none' }}
                  >
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Set Price & Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Original Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={prodOriginalPrice || ''} 
                    onChange={e => handleOriginalPriceChange(parseInt(e.target.value) || 0)} 
                    placeholder="1999" 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Discount (%)</label>
                  <input 
                    type="number" 
                    value={prodDiscount || ''} 
                    onChange={e => handleDiscountChange(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} 
                    placeholder="25" 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Sale Price (₹) (Calculated)</label>
                  <input 
                    type="number" 
                    required
                    value={prodPrice || ''} 
                    onChange={e => setProdPrice(parseInt(e.target.value) || 0)} 
                    placeholder="1499" 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontWeight: 600 }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Stock Available</label>
                  <input type="number" min="0" required value={prodStock} onChange={e => setProdStock(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontWeight: 600 }} />
                </div>
              </div>

              {/* Upload product images */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', alignItems: 'flex-end' }}>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Product Image URL</label>
                  <input 
                    type="text" 
                    required 
                    value={prodImage} 
                    onChange={e => setProdImage(e.target.value)} 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>SKU</label>
                  <input type="text" value={prodSku} onChange={e => setProdSku(e.target.value)} placeholder="MD-EAR-001" style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <button
                  type="button"
                  onClick={triggerMockUpload}
                  disabled={isUploading}
                  style={{
                    backgroundColor: 'var(--gold-light)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--gold-primary)',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--gold-primary)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--gold-light)'; e.currentTarget.style.color = 'var(--gold-primary)'; }}
                >
                  <Upload size={16} />
                  {isUploading ? 'Uploading...' : 'Upload Image File'}
                </button>
              </div>

              {/* Image Preview */}
              {prodImage && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Image Preview:</span>
                  <img 
                    src={prodImage} 
                    alt="Upload Preview" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-light)' }} 
                  />
                </div>
              )}

              <div className="input-group">
                <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea 
                  rows={3} 
                  required 
                  value={prodDesc} 
                  onChange={e => setProdDesc(e.target.value)}
                  placeholder="Enter details on styling and craftsmanship."
                  style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '12px', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Gold Plating</label>
                  <input 
                    type="text" 
                    required 
                    value={prodPlating} 
                    onChange={e => setProdPlating(e.target.value)} 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Anti-Tarnish Coating</label>
                  <input 
                    type="text" 
                    required 
                    value={prodTarnish} 
                    onChange={e => setProdTarnish(e.target.value)} 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Base Metal Core</label>
                  <input 
                    type="text" 
                    required 
                    value={specBaseMetal} 
                    onChange={e => setSpecBaseMetal(e.target.value)} 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Plating Thickness</label>
                  <input 
                    type="text" 
                    required 
                    value={specCoatingThickness} 
                    onChange={e => setSpecCoatingThickness(e.target.value)} 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Weight</label>
                  <input 
                    type="text" 
                    required 
                    value={specWeight} 
                    onChange={e => setSpecWeight(e.target.value)} 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Waterproof</label>
                  <input 
                    type="text" 
                    required 
                    value={specWaterproof} 
                    onChange={e => setSpecWaterproof(e.target.value)} 
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => { setEditingProduct(null); setShowAddForm(false); resetForm(); }}
                  className="gold-button-outline"
                  style={{ flex: 1, padding: '12px 20px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="gold-button" style={{ flex: 1, padding: '12px 20px' }}>
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          )}

          {/* List of Products */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            {/* Search Option */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products by name or description..."
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Categories filters for easy selection */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedProductCategory('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid ' + (selectedProductCategory === 'all' ? 'var(--gold-primary)' : 'var(--border-light)'),
                  backgroundColor: selectedProductCategory === 'all' ? 'var(--gold-primary)' : 'var(--bg-secondary)',
                  color: selectedProductCategory === 'all' ? '#fff' : 'var(--text-primary)',
                  transition: 'var(--transition-fast)'
                }}
              >
                All Categories
              </button>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedProductCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid ' + (selectedProductCategory === cat ? 'var(--gold-primary)' : 'var(--border-light)'),
                    backgroundColor: selectedProductCategory === cat ? 'var(--gold-primary)' : 'var(--bg-secondary)',
                    color: selectedProductCategory === cat ? '#fff' : 'var(--text-primary)',
                    transition: 'var(--transition-fast)',
                    textTransform: 'capitalize'
                  }}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Image</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Product Details</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Original Price (MRP)</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Sale Price</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Discount</th>
                    <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => {
                      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                                            p.description.toLowerCase().includes(productSearch.toLowerCase());
                      const matchesCategory = selectedProductCategory === 'all' || 
                                              p.category.toLowerCase() === selectedProductCategory.toLowerCase();
                      return matchesSearch && matchesCategory;
                    })
                    .map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px' }}>
                          <img src={p.image || ''} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-light)' }} />
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                          <span style={{ fontWeight: 600, display: 'block', fontSize: '0.88rem' }}>{p.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.metalOptions[0] || '18k Plated'}</span>
                        </td>
                        <td style={{ padding: '12px', textTransform: 'capitalize', color: 'var(--text-primary)' }}>{p.category.replace('_', ' ')}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          <span style={{ textDecoration: p.originalPrice && p.originalPrice > p.price ? 'line-through' : 'none' }}>
                            ₹ {p.originalPrice || p.price}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--gold-primary)', fontWeight: 600 }}>
                          ₹ {p.price}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {p.discount && p.discount > 0 ? (
                            <span style={{ backgroundColor: 'rgba(231, 76, 60, 0.08)', color: '#e74c3c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                              {p.discount}% OFF
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>0%</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => startEdit(p)} 
                              style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px', background: 'none', border: 'none' }} 
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold-primary)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                              title="Edit product"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)} 
                              style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px', background: 'none', border: 'none' }} 
                              onMouseEnter={e => e.currentTarget.style.color = '#ff4d4f'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDERS */}
      {activeTab === 'orders' && (() => {
        const filteredOrders = orders.filter(o => {
          const matchesSearch = 
            o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            o.customerPhone.includes(orderSearchQuery);
          const matchesStatus = 
            orderStatusFilter === 'all' || 
            o.status.toLowerCase() === orderStatusFilter.toLowerCase();
          return matchesSearch && matchesStatus;
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Orders Search and Filters */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              marginBottom: '4px',
              padding: '12px 24px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <input 
                  type="text" 
                  placeholder="Search orders (ID, name, phone)..." 
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['all', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: orderStatusFilter === st ? 'var(--gold-primary)' : 'var(--border-light)',
                      backgroundColor: orderStatusFilter === st ? 'var(--gold-primary)' : 'transparent',
                      color: orderStatusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '14px 12px', fontWeight: 600 }}>Order ID</th>
                      <th style={{ padding: '14px 12px', fontWeight: 600 }}>Customer Details</th>
                      <th style={{ padding: '14px 12px', fontWeight: 600 }}>Items Count</th>
                      <th style={{ padding: '14px 12px', fontWeight: 600 }}>Tracking details</th>
                      <th style={{ padding: '14px 12px', fontWeight: 600 }}>Total Amount</th>
                      <th style={{ padding: '14px 12px', fontWeight: 600 }}>Fulfillment State</th>
                      <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{o.id}</td>
                        <td style={{ padding: '14px 12px', color: 'var(--text-primary)' }}>
                          <strong>{o.customerName}</strong><br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.customerPhone}</span>
                        </td>
                        <td style={{ padding: '14px 12px', color: 'var(--text-primary)' }}>{o.items.reduce((sum, i) => sum + i.quantity, 0)} items</td>
                        <td style={{ padding: '14px 12px', color: 'var(--text-primary)' }}>
                          {o.trackingNumber ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', fontWeight: 600 }}>{o.trackingNumber}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Carrier: {o.courierPartner}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No tracking uploaded</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 12px', color: 'var(--gold-primary)', fontWeight: 600 }}>₹ {o.totalAmount}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            backgroundColor: 
                              o.status === 'Delivered' ? 'rgba(46, 204, 113, 0.08)' : 
                              o.status === 'Shipped' ? 'rgba(52, 152, 219, 0.08)' : 
                              o.status === 'Confirmed' ? 'rgba(155, 89, 182, 0.08)' :
                              o.status === 'Cancelled' ? 'rgba(231, 76, 60, 0.08)' : 
                              'rgba(241, 196, 15, 0.08)',
                            color: 
                              o.status === 'Delivered' ? '#27ae60' : 
                              o.status === 'Shipped' ? '#2980b9' : 
                              o.status === 'Confirmed' ? '#8e44ad' :
                              o.status === 'Cancelled' ? '#c0392b' : 
                              '#d35400'
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          <button 
                            onClick={() => openInspectModal(o)}
                            style={{
                              cursor: 'pointer',
                              color: 'var(--gold-primary)',
                              padding: '6px 12px',
                              border: '1px solid var(--gold-primary)',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'none',
                              transition: 'var(--transition-fast)'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = 'var(--gold-primary)';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--gold-primary)';
                            }}
                          >
                            <Eye size={12} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No orders match the search or filter query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          {/* Inspect modal */}
          {inspectingOrder && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(6px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}>
              <div className="glass" style={{
                width: '100%',
                maxWidth: '650px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 300 }}>Inspect Order: {inspectingOrder.id}</h3>
                  <button onClick={() => setInspectingOrder(null)} style={{ cursor: 'pointer', color: 'var(--text-secondary)', background: 'none', border: 'none' }}><X size={18} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Fulfillment Status</label>
                    <select
                      value={inspectingOrder.status}
                      onChange={e => handleUpdateStatus(inspectingOrder.id, e.target.value as any)}
                      style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '10px', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Payment Status</label>
                    <select
                      value={inspectingOrder.paymentStatus}
                      onChange={e => handleUpdatePayment(inspectingOrder.id, e.target.value as any)}
                      style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '10px', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Edit Delivery Date & Tracking Number */}
                <form onSubmit={handleSaveShippingDetails} style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Courier Shipment Tracking Controls
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="input-group">
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estimated Delivery</label>
                      <input 
                        type="text" 
                        value={modalEstDelivery} 
                        onChange={e => setModalEstDelivery(e.target.value)} 
                        placeholder="e.g. July 22, 2026"
                        style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tracking ID (Optional)</label>
                      <input 
                        type="text" 
                        value={modalTrackingNum} 
                        onChange={e => setModalTrackingNum(e.target.value)} 
                        placeholder="e.g. TRK983742"
                        style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                  <button type="submit" className="gold-button" style={{ alignSelf: 'flex-end', padding: '8px 16px', fontSize: '0.75rem' }}>
                    Save Tracking Details
                  </button>
                </form>

                <div style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '18px', color: 'var(--text-primary)' }}>
                  <h4 style={{ color: 'var(--gold-primary)', marginBottom: '8px', fontWeight: 600 }}>Customer Details</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    <strong>Name:</strong> {inspectingOrder.customerName} ({inspectingOrder.customerPhone})<br />
                    <strong>Email:</strong> {inspectingOrder.customerEmail}<br />
                    <strong>Shipping Address:</strong> {inspectingOrder.addressLine}, {inspectingOrder.city}, {inspectingOrder.state} - {inspectingOrder.pincode}<br />
                    <strong>Delivery Channel:</strong> {inspectingOrder.courierPartner} | Method: {inspectingOrder.paymentMethod}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--gold-primary)', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 600 }}>Ordered Products</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {inspectingOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', color: 'var(--text-primary)' }}>
                        <img src={item.product.image} alt={item.product.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                        <div style={{ flex: 1, fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{item.product.name} (x{item.quantity})</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Metal: {item.selectedMetal} | Stone: {item.selectedStone}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹ {item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '18px' }}>
                  <button onClick={() => setInspectingOrder(null)} className="gold-button-outline" style={{ padding: '10px 20px' }}>Close</button>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--gold-primary)' }}>Total Amount: ₹ {inspectingOrder.totalAmount}</strong>
                </div>
              </div>
            </div>
          )}
          </div>
        );
      })()}

      {/* 4. CUSTOMERS */}
      {activeTab === 'customers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>
              Registered Clientele & Contacts
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Customer Name</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Phone Number</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Primary Address</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Order History</th>
                    <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 600 }}>Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {customersList.map((cust, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{cust.name}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--text-primary)' }}>{cust.phone}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cust.address}>
                        {cust.address}
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--text-primary)' }}>
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: 'var(--gold-light)',
                          color: 'var(--gold-primary)',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}>
                          {cust.ordersCount} orders
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--gold-primary)' }}>
                        ₹ {cust.totalSpent.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {customersList.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No customer history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. PAYMENTS */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* COD Payments Card */}
            <div className="glass" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: 'rgba(230, 126, 34, 0.08)', padding: '10px', borderRadius: '50%', color: '#e67e22' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>COD Cash Orders</h4>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{codCount} Transactions</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Uncancelled Amount Collectable:</span>
                <h5 style={{ fontSize: '1.25rem', color: 'var(--gold-primary)', fontWeight: 600, marginTop: '4px' }}>₹ {codAmount.toLocaleString('en-IN')}</h5>
              </div>
            </div>

            {/* Online Payments Card */}
            <div className="glass" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.08)', padding: '10px', borderRadius: '50%', color: '#3498db' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Online Payments</h4>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{onlineCount} Transactions</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Settled Revenue:</span>
                <h5 style={{ fontSize: '1.25rem', color: '#27ae60', fontWeight: 600, marginTop: '4px' }}>₹ {onlineAmount.toLocaleString('en-IN')}</h5>
              </div>
            </div>

            {/* Gateway Status Summary */}
            <div className="glass" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Gateway Settlement States
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span>Settled & Paid:</span>
                  <span style={{ fontWeight: 600, color: '#27ae60' }}>{orders.filter(o => o.paymentStatus === 'Paid').length} Orders</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span>Payment Pending:</span>
                  <span style={{ fontWeight: 600, color: '#e67e22' }}>{orders.filter(o => o.paymentStatus === 'Pending').length} Orders</span>
                </div>
              </div>
            </div>
          </div>

          {/* List of Payments */}
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>
              Transaction Log
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Order ID</th>
                    <th style={{ padding: '12px' }}>Customer Name</th>
                    <th style={{ padding: '12px' }}>Payment Channel</th>
                    <th style={{ padding: '12px' }}>Settlement State</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{o.id}</td>
                      <td style={{ padding: '12px' }}>{o.customerName}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: o.paymentMethod === 'Online' ? 'rgba(52, 152, 219, 0.08)' : 'rgba(230, 126, 34, 0.08)',
                          color: o.paymentMethod === 'Online' ? '#2980b9' : '#e67e22'
                        }}>{o.paymentMethod}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={o.paymentStatus}
                          onChange={e => handleUpdatePayment(o.id, e.target.value as any)}
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-light)',
                            padding: '4px 8px',
                            color: o.paymentStatus === 'Paid' ? '#27ae60' : '#e67e22',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Pending" style={{ color: '#e67e22' }}>Pending</option>
                          <option value="Paid" style={{ color: '#27ae60' }}>Paid</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--gold-primary)' }}>₹ {o.totalAmount}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LOW REVIEWS */}
      {activeTab === 'low-reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <MessageSquare size={20} style={{ color: 'var(--gold-primary)' }} />
              <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>
                Low Ratings & Grievances Monitor (≤ 3 Stars)
              </h4>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              This portal aggregates all reviews that received <strong>3 stars or fewer</strong> across all products. Use this to monitor customer issues, quality control concerns, or delete invalid reviews.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Product</th>
                    <th style={{ padding: '12px' }}>Reviewer</th>
                    <th style={{ padding: '12px' }}>Rating</th>
                    <th style={{ padding: '12px' }}>Comment</th>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowReviews.map(r => {
                    const product = products.find(p => p.id === r.productId);
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {product?.image && (
                            <img src={product.image} alt={product.name} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                          )}
                          <div>
                            <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>{product?.name || 'Unknown Product'}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {r.productId}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{r.userName}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                fill={star <= r.rating ? 'var(--gold-primary)' : 'none'}
                                color={star <= r.rating ? 'var(--gold-primary)' : 'var(--text-muted)'}
                              />
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)', maxWidth: '300px', wordBreak: 'break-word' }}>
                          "{r.comment}"
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ff4d4f',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'var(--transition-fast)'
                            }}
                            title="Delete Review"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {lowReviews.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <Check size={28} style={{ color: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: '6px', borderRadius: '50%' }} />
                          <strong style={{ color: 'var(--text-primary)' }}>All Clear!</strong>
                          <span>No reviews rated 3 stars or below were found in the database.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <Settings size={20} style={{ color: 'var(--gold-primary)' }} />
              <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>
                Catalog Configuration & Settings
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Manage categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Manage Categories</h5>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Register or clean up active product classification categories. Categories added here will immediately appear in the catalog publishing form dropdown.
                </span>

                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={newCatInput}
                    onChange={e => setNewCatInput(e.target.value)}
                    placeholder="e.g. Rings"
                    style={{ flex: 1, border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                  />
                  <button type="submit" className="gold-button" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>
                    Add
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Categories List:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableCategories.map(cat => {
                      const count = products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
                      return (
                        <span key={cat} style={{
                          padding: '6px 12px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--text-primary)'
                        }}>
                          {cat.replace('_', ' ').toUpperCase()}
                          <strong style={{ color: 'var(--gold-primary)', backgroundColor: 'var(--gold-light)', padding: '2px 6px', borderRadius: '50%', fontSize: '0.65rem' }}>{count}</strong>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              color: 'rgba(231, 76, 60, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              marginLeft: '2px',
                              outline: 'none',
                              transition: 'color 0.15s ease'
                            }}
                            title={`Delete category ${cat}`}
                            onMouseEnter={e => (e.currentTarget.style.color = '#e74c3c')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(231, 76, 60, 0.7)')}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* General Admin Vault info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid var(--border-light)' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Settings Information</h5>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  This console syncs directly with Supabase production tables if credentials are set up in the environment variables, otherwise it defaults to the sandbox local storage environment.
                </p>
                <div style={{ marginTop: '10px', backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', display: 'block', fontWeight: 600, color: 'var(--gold-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Database Sync State</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Supabase Engine: Connected & Active (Direct Mode)
                  </span>

                  <button
                    onClick={handleResetProducts}
                    disabled={isResettingProducts}
                    style={{
                      marginTop: '16px',
                      padding: '10px 16px',
                      fontSize: '0.8rem',
                      width: '100%',
                      backgroundColor: 'rgba(231, 76, 60, 0.1)',
                      color: '#e74c3c',
                      border: '1px solid rgba(231, 76, 60, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontWeight: 600
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#e74c3c';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                      e.currentTarget.style.color = '#e74c3c';
                    }}
                  >
                    {isResettingProducts ? 'Resetting Catalog...' : 'Reset & Seed Test Catalog'}
                  </button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Coupon & Promotion Manager</h5>
              <form onSubmit={addCoupon} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                <input required value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Code e.g. FESTIVE20" style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px' }} />
                <input type="number" min="1" max="100" value={couponValue} onChange={e => setCouponValue(Number(e.target.value))} placeholder="Discount %" style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px' }} />
                <input type="number" min="0" value={couponMinOrder} onChange={e => setCouponMinOrder(Number(e.target.value))} placeholder="Min order ₹" style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px' }} />
                <button className="gold-button" style={{ padding: '10px 16px', fontSize: '.75rem' }}>Create</button>
              </form>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>{coupons.map(c => <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: '1px solid var(--border-light)', borderRadius: '6px', opacity: c.active ? 1 : .5 }}><strong>{c.code}</strong><span>{c.value}% off · ₹{c.minOrder}+ </span><button onClick={() => saveCoupons(coupons.map(item => item.code === c.code ? { ...item, active: !item.active } : item))} style={{ cursor: 'pointer', color: 'var(--gold-primary)' }}>{c.active ? 'Disable' : 'Enable'}</button><button onClick={() => saveCoupons(coupons.filter(item => item.code !== c.code))} style={{ cursor: 'pointer', color: '#c0392b' }}>×</button></div>)}</div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); siteSettingsService.save(siteSettings); alert('Homepage, contact and SEO settings saved.'); }} style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px' }}>Homepage, Store & SEO Controls</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                {[['Hero title','heroTitle'],['Hero subtitle','heroSubtitle'],['WhatsApp number','whatsapp'],['Free shipping threshold','freeShippingThreshold'],['SEO title','seoTitle'],['SEO description','seoDescription'],['Hero image URL','heroImage'],['Hero description','heroDescription']].map(([label, field]) => <label key={field} style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>{label}<input value={String(siteSettings[field as keyof SiteSettings])} onChange={e => setSiteSettings({ ...siteSettings, [field]: field === 'freeShippingThreshold' ? Number(e.target.value) : e.target.value })} style={{ display: 'block', width: '100%', marginTop: '5px', padding: '10px', border: '1px solid var(--border-light)', borderRadius: '6px' }} /></label>)}
              </div><button className="gold-button" style={{ marginTop: '14px', padding: '10px 16px', fontSize: '.75rem' }}>Save Website Controls</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .pin-btn:hover {
          border-color: var(--gold-primary) !important;
          color: var(--gold-primary) !important;
          background-color: var(--gold-light) !important;
        }
      `}</style>
    </div>
  );
};
