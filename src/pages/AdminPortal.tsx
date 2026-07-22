import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import { databaseService } from '../services/database';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import type { Order } from '../services/database';
import type { Product } from '../data/products';
import type { InstagramFeedItem } from '../services/siteSettings';
import { 
  Lock, Trash2, Edit3, Plus, Package, Clock, DollarSign, 
  Eye, X, Check, Truck, CreditCard, Settings, Percent,
  XCircle, Star, MessageSquare, ArrowUp, ArrowDown, Home, Search, Globe
} from 'lucide-react';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'payments' | 'settings' | 'reviews' | 'media' | 'notifications' | 'homepage';

export const AdminPortal: React.FC = () => {
  const { 
    products, 
    refreshProducts, 
    orders, 
    refreshOrders,
    categories,
    addCategory,
    deleteCategory,
    coupons,
    refreshCoupons,
    saveCoupon,
    deleteCoupon,
    siteSettings,
    saveSiteSettings,
    refreshSiteSettings,
    emailLogs,
    triggerEmailNotification,
    sendEmailViaResend,
    replyToReview
  } = useStore();

  const { showToast } = useToast();

  const availableCategories = categories;


  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isPending, setIsPending] = useState(false);
    
  // Search & Filter state for catalog list
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');

  // Search & Filter state for orders list
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const [newCatInput, setNewCatInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinOrder, setCouponMinOrder] = useState(0);
  const [couponType, setCouponType] = useState<'percent' | 'fixed'>('percent');
  const [couponDescription, setCouponDescription] = useState('');

  // Homepage manager state
  const [igUrlInput, setIgUrlInput] = useState('');
  const [igLoading, setIgLoading] = useState(false);
  const [newArrivalsIds, setNewArrivalsIds] = useState<string[]>(siteSettings.homeNewArrivals || []);
  const [bestSellersIds, setBestSellersIds] = useState<string[]>(siteSettings.homeBestSellers || []);
  const [trendingIds, setTrendingIds] = useState<string[]>(siteSettings.homeTrending || []);
  const [igFeedUrls, setIgFeedUrls] = useState<InstagramFeedItem[]>(siteSettings.instagramFeedUrls || []);
  const [homepageSearch, setHomepageSearch] = useState('');
  const [isSavingHomepage, setIsSavingHomepage] = useState(false);

  // Home categories manager
  const [homeCategories, setHomeCategories] = useState(siteSettings.homeCategories || []);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  const productFormRef = useRef<HTMLFormElement>(null);

  const scrollToProductForm = () => {
    setTimeout(() => productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };


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
  const [prodImage, setProdImage] = useState('');
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

  // Review Moderation & Replies
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [replyInputs, setReplyInputs] = useState<{[reviewId: string]: string}>({});

  const loadAllReviews = async () => {
    try {
      const data = await databaseService.getAllReviews();
      setAllReviews(data);
    } catch (err) {
      console.warn("Failed to load reviews:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllReviews();
    }
  }, [isAuthenticated, products]);

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await databaseService.deleteProductReview(reviewId);
        loadAllReviews();
      } catch (err) {
        console.error("Failed to delete review:", err);
      }
    }
  };

  const handlePostReply = async (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) return;
    try {
      await replyToReview(reviewId, text);
      setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
      loadAllReviews();
      showToast('Reply posted successfully.', 'success');
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  // Admin signs in with Supabase Auth only.
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsPending(true);

    if (!isSupabaseConfigured) {
      setPinError('Supabase is not configured. Please set up VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setIsPending(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail.trim(), password: adminPassword });
    setIsPending(false);
    if (!error) {
      setIsAuthenticated(true);
    } else {
      setPinError('Invalid email or password. Please use the Supabase admin account.');
    }
  };



  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }: any) => {
      setIsAuthenticated(data.session?.user?.email === 'admin@maadiaries.com');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setIsAuthenticated(session?.user?.email === 'admin@maadiaries.com');
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (isAuthenticated) { refreshCoupons(); } }, [isAuthenticated]);
  useEffect(() => { if (isAuthenticated) { refreshSiteSettings(); } }, [isAuthenticated]);
  useEffect(() => {
    setNewArrivalsIds(siteSettings.homeNewArrivals || []);
    setBestSellersIds(siteSettings.homeBestSellers || []);
    setTrendingIds(siteSettings.homeTrending || []);
    setIgFeedUrls(siteSettings.instagramFeedUrls || []);
  }, [siteSettings]);

  // Instagram feed handlers
  const addInstagramUrl = async () => {
    const url = igUrlInput.trim();
    if (!url) return;
    if (!url.includes('instagram.com')) { showToast('Please enter a valid Instagram URL.', 'error'); return; }
    if (igFeedUrls.some(item => item.url === url)) { showToast('This URL is already added.', 'error'); return; }
    setIgLoading(true);
    try {
      const isReel = url.includes('/reel/');
      const isPost = url.includes('/p/');
      const postType = isReel ? 'reel' : isPost ? 'post' : 'unknown';
      let thumbnail = '';
      let title = '';
      try {
        const resp = await fetch(`/api/instagram-oembed?url=${encodeURIComponent(url)}`);
        if (resp.ok) {
          const data = await resp.json();
          thumbnail = data.thumbnail || '';
          title = data.title || '';
        }
      } catch { /* oEmbed failed, still add the URL */ }
      const newItem: InstagramFeedItem = { url, sortOrder: igFeedUrls.length, type: postType, thumbnail, title };
      setIgFeedUrls(prev => [...prev, newItem]);
      setIgUrlInput('');
      showToast('Instagram post added successfully.', 'success');
    } catch { showToast('Failed to add Instagram URL.', 'error'); }
    setIgLoading(false);
  };

  const removeInstagramUrl = (url: string) => {
    setIgFeedUrls(prev => prev.filter(item => item.url !== url));
  };

  const moveInstagramUrl = (idx: number, dir: -1 | 1) => {
    setIgFeedUrls(prev => {
      const arr = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr.map((item, i) => ({ ...item, sortOrder: i }));
    });
  };

  const toggleProductInList = (list: string[], setList: (v: string[]) => void, productId: string) => {
    if (list.includes(productId)) {
      setList(list.filter(id => id !== productId));
    } else {
      setList([...list, productId]);
    }
  };

  const moveProductInList = (list: string[], setList: (v: string[]) => void, idx: number, dir: -1 | 1) => {
    const arr = [...list];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setList(arr);
  };

  const saveHomepageSettings = async () => {
    setIsSavingHomepage(true);
    try {
      await saveSiteSettings({
        ...siteSettings,
        homeNewArrivals: newArrivalsIds,
        homeBestSellers: bestSellersIds,
        homeTrending: trendingIds,
        homeCategories,
        instagramFeedUrls: igFeedUrls.map((item, i) => ({ ...item, sortOrder: i }))
      });
      showToast('Home page settings saved successfully.', 'success');
    } catch { showToast('Failed to save home page settings.', 'error'); }
    setIsSavingHomepage(false);
  };

  const homepageSearchResults = homepageSearch.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(homepageSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(homepageSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(homepageSearch.toLowerCase())
      )
    : products.slice(0, 20);
  const addCoupon = async (e: React.FormEvent) => { e.preventDefault(); const code = couponCode.trim().toUpperCase(); if (!code) return; if (coupons.some(c => c.code === code)) { showToast('This coupon code already exists.', 'error'); return; } await saveCoupon({ code, type: couponType, value: couponValue, minOrder: couponMinOrder, active: true, description: couponDescription || undefined }); showToast(`Coupon "${code}" created successfully.`, 'success'); setCouponCode(''); setCouponValue(10); setCouponMinOrder(0); setCouponType('percent'); setCouponDescription(''); };

  // Mock upload simulator
  const handleImageFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please choose an image file.', 'error'); return; }
    if (file.size > 4 * 1024 * 1024) { showToast('Please use an image smaller than 4 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setProdImage(String(reader.result));
    reader.readAsDataURL(file);
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
    if (prodImage && !prodImage.startsWith('https://') && !prodImage.startsWith('data:image/')) {
      showToast('Product image URL must use HTTPS.', 'error');
      return;
    }
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
    if (prodImage && !prodImage.startsWith('https://') && !prodImage.startsWith('data:image/')) {
      showToast('Product image URL must use HTTPS.', 'error');
      return;
    }
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
    scrollToProductForm();
  };

  const resetForm = () => {
    setProdName('');
    setProdCategory('earrings');
    setProdOriginalPrice(0);
    setProdDiscount(0);
    setProdPrice(0);
    setProdStock(0);
    setProdSku('');
    setProdImage('');
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

      // Automatically trigger delivery update email on Confirmed, Shipped, or Delivered
      const order = orders.find(o => o.id === orderId);
      if (order && order.customerEmail && ['Confirmed', 'Shipped', 'Delivered'].includes(status)) {
        const trackingVal = inspectingOrder?.id === orderId ? (modalTrackingNum || order.trackingNumber) : order.trackingNumber;
        const estDeliveryVal = inspectingOrder?.id === orderId ? (modalEstDelivery || order.estimatedDelivery) : order.estimatedDelivery;

        // Send real delivery update email via Resend (FROM: deliveryupdate@maadiaries.com)
        await sendEmailViaResend('delivery_update', {
          order: {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            estimatedDelivery: estDeliveryVal || order.estimatedDelivery,
            courierPartner: order.courierPartner
          },
          status,
          trackingNumber: trackingVal,
          estimatedDelivery: estDeliveryVal
        });

        // Also log to email_logs for admin dashboard visibility
        let subject = '';
        let body = '';
        if (status === 'Confirmed') {
          subject = `Order Confirmed - ID: ${order.id}`;
          body = `Dear ${order.customerName},\n\nWe are pleased to inform you that your order (ID: ${order.id}) has been confirmed! We are preparing it for shipment.\n\nThank you for shopping with Maa Diaries.`;
        } else if (status === 'Shipped') {
          subject = `Order Shipped - ID: ${order.id}`;
          body = `Dear ${order.customerName},\n\nGood news! Your order (ID: ${order.id}) has been shipped and is on its way.\n\n${trackingVal ? `Courier Tracking ID: ${trackingVal} (${order.courierPartner || 'Delivery Partner'})\n` : ''}${estDeliveryVal ? `Estimated Delivery: ${estDeliveryVal}\n` : ''}\nThank you for shopping with Maa Diaries.`;
        } else if (status === 'Delivered') {
          subject = `Order Delivered - ID: ${order.id}`;
          body = `Dear ${order.customerName},\n\nYour order (ID: ${order.id}) has been successfully delivered!\n\nWe hope you love your new jewelry. If you have any feedback or reviews, please let us know.\n\nThank you for choosing Maa Diaries.`;
        }

        if (subject && body) {
          await triggerEmailNotification(order.customerEmail, subject, body);
        }
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
      showToast('Order shipment courier details updated successfully!', 'success');
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
      showToast('New category successfully saved to database.', 'success');
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    const productsInCat = products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
    if (productsInCat.length > 0) {
      showToast(`Cannot delete category "${catName}" because it is currently used by ${productsInCat.length} product(s). Please reassign or delete those products first.`, 'error');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
      await deleteCategory(catName);
    }
  };

  // --- Analytical Aggregations ---
  const revenue = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;

  // Today's stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(todayStr));
  const todayOrdersCount = todayOrders.length;
  const todaySales = todayOrders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);

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
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10000
      }}>
        <form onSubmit={handlePinSubmit} style={{
          padding: '48px 40px',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            backgroundColor: '#fdf3e4',
            padding: '18px',
            borderRadius: '50%',
            color: '#b08d57'
          }}>
            <Lock size={28} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '6px', color: '#1a1a1a', letterSpacing: '0.04em' }}>
              Maa Diaries
            </h2>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '8px', color: '#b08d57', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Admin Panel
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#777' }}>
              Sign in with the admin account.
            </p>
          </div>

          {pinError && <span style={{ fontSize: '0.82rem', color: '#d32f2f', fontWeight: 500, textAlign: 'center' }}>{pinError}</span>}

          <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Admin email" autoComplete="email" required style={{ width: '100%', padding: '14px 16px', border: '1px solid #d0d0d0', borderRadius: '8px', backgroundColor: '#fafafa', color: '#1a1a1a', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
          <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required style={{ width: '100%', padding: '14px 16px', border: '1px solid #d0d0d0', borderRadius: '8px', backgroundColor: '#fafafa', color: '#1a1a1a', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />

          <button type="submit" style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#b08d57',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            transition: 'background-color 0.2s',
            letterSpacing: '0.03em'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#9a7a4a'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#b08d57'}
          >
            Sign In
          </button>
          <span style={{ fontSize: '0.7rem', color: '#999' }}>Use the single secure owner account configured in Supabase Auth.</span>
        </form>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      color: '#1a1a1a',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      zIndex: 10000
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 32px 40px',
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
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div className="luxury-loader" style={{ borderTopColor: '#b08d57', width: '50px', height: '50px' }} />
          <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 500, letterSpacing: '0.05em' }}>
            SYNCING DATABASE...
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '20px',
        paddingTop: '32px',
        marginBottom: '32px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontFamily: 'Georgia, serif', color: '#1a1a1a', fontWeight: 300, letterSpacing: '0.02em' }}>
            Maa Diaries <span style={{ color: '#b08d57' }}>Admin</span>
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>Management Console</span>
        </div>
        <button 
          onClick={async () => { await supabase.auth.signOut(); setIsAuthenticated(false); }}
          style={{
            padding: '8px 20px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#b08d57',
            backgroundColor: 'transparent',
            border: '1px solid #b08d57',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.03em'
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fdf3e4'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          Lock Console
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '32px',
        overflowX: 'auto',
        paddingBottom: '0'
      }}>
        {([
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'products', label: 'Products' },
          { id: 'orders', label: 'Orders' },
          { id: 'customers', label: 'Customers' },
          { id: 'payments', label: 'Payments' },
          { id: 'reviews', label: 'Reviews' },
          { id: 'notifications', label: 'Emails' },
          { id: 'homepage', label: 'Home Page' },
          { id: 'settings', label: 'Settings' }
        ] as any[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              color: activeTab === tab.id ? '#b08d57' : '#888',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #b08d57' : '2px solid transparent',
              transition: 'all 0.2s',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#fdf3e4', padding: '12px', borderRadius: '50%', color: '#b08d57' }}>
                <Percent size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Total Products</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginTop: '4px' }}>{products.length} Items</h4>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#e8f4fd', padding: '12px', borderRadius: '50%', color: '#1976d2' }}>
                <Package size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Total Orders</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginTop: '4px' }}>{orders.length} Placed</h4>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#fff8e1', padding: '12px', borderRadius: '50%', color: '#f57c00' }}>
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Pending Orders</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginTop: '4px' }}>{pendingOrdersCount} Wait</h4>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '50%', color: '#388e3c' }}>
                <Check size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Delivered Orders</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginTop: '4px' }}>{deliveredOrdersCount} Done</h4>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#fdecea', padding: '12px', borderRadius: '50%', color: '#d32f2f' }}>
                <XCircle size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Cancelled Orders</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginTop: '4px' }}>{cancelledOrdersCount} Items</h4>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#fdf3e4', padding: '12px', borderRadius: '50%', color: '#b08d57' }}>
                <DollarSign size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Revenue</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginTop: '4px' }}>₹ {revenue.toLocaleString('en-IN')}</h4>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#e8f4fd', padding: '12px', borderRadius: '50%', color: '#1976d2' }}>
                <Package size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Orders Today</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginTop: '4px' }}>{todayOrdersCount}</h4>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '50%', color: '#388e3c' }}>
                <DollarSign size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Sales Today</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginTop: '4px' }}>₹ {todaySales.toLocaleString('en-IN')}</h4>
              </div>
            </div>
          </div>

          {/* Recent Orders List */}
          <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '20px', fontFamily: 'Georgia, serif', color: '#b08d57' }}>
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
              onClick={() => { resetForm(); setShowAddForm(true); scrollToProductForm(); }}
              className="gold-button"
              style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px', padding: '10px 20px', fontSize: '0.8rem' }}
            >
              <Plus size={16} /> Add Product
            </button>
          )}

          {(showAddForm || editingProduct) && (
            <form 
              ref={productFormRef}
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
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '15px', alignItems: 'flex-end' }}>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Product Image URL</label>
                  <input 
                    type="text" 
                    required 
                    value={prodImage} 
                    onChange={e => setProdImage(e.target.value)} 
                    placeholder="Paste image URL here..."
                    style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>SKU</label>
                  <input type="text" value={prodSku} onChange={e => setProdSku(e.target.value)} placeholder="MD-EAR-001" style={{ width: '100%', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ flex: 1, border: '1px solid var(--border-light)', color: 'var(--gold-primary)', padding: '12px 6px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', backgroundColor: 'var(--bg-primary)', display: 'block' }}>
                    Choose File<input type="file" accept="image/*" onChange={e => handleImageFile(e.target.files?.[0])} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {prodImage && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Image Preview:</span>
                  <img 
                    src={prodImage} 
                    alt="Upload Preview" 
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
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



      {/* REVIEW MODERATION & REPLY */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <MessageSquare size={20} style={{ color: 'var(--gold-primary)' }} />
              <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>
                Full Product Review Moderation Console
              </h4>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              View and moderate customer feedback. You can reply directly to any review, and your official response will display on the public storefront.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Product</th>
                    <th style={{ padding: '12px' }}>Reviewer</th>
                    <th style={{ padding: '12px' }}>Rating</th>
                    <th style={{ padding: '12px' }}>Comment & Reply</th>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allReviews.map(r => {
                    const product = products.find(p => p.id === r.productId);
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)', verticalAlign: 'top' }}>
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
                        <td style={{ padding: '12px', color: 'var(--text-secondary)', maxWidth: '350px' }}>
                          <div style={{ fontStyle: 'italic', marginBottom: '8px', wordBreak: 'break-word' }}>"{r.comment}"</div>
                          
                          {/* Official Admin Reply display */}
                          {r.replyComment && (
                            <div style={{ backgroundColor: 'var(--gold-light)', borderLeft: '2.5px solid var(--gold-primary)', padding: '8px 10px', borderRadius: '4px', fontSize: '0.78rem', marginBottom: '8px' }}>
                              <strong style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '2px' }}>Maa Diaries Reply:</strong>
                              <span style={{ color: 'var(--text-primary)' }}>{r.replyComment}</span>
                              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(r.repliedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          )}

                          {/* Post reply form */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <input 
                              type="text" 
                              value={replyInputs[r.id] || ''} 
                              onChange={(e) => setReplyInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                              placeholder={r.replyComment ? "Update official reply..." : "Write official reply..."} 
                              style={{ flex: 1, padding: '6px 8px', fontSize: '0.78rem', border: '1px solid var(--border-light)', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
                            />
                            <button onClick={() => handlePostReply(r.id)} style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'var(--gold-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                              Reply
                            </button>
                          </div>
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
                  {allReviews.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No reviews found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL CONSOLE & NOTIFICATION LOGS */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <Settings size={20} style={{ color: 'var(--gold-primary)' }} />
              <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>
                Email Logs & Notification Console
              </h4>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Monitor system emails automatically generated by order dispatch events, support inquiries, and customer feedback.
            </p>

            <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Dispatched Notification Logs</h5>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Timestamp</th>
                    <th style={{ padding: '12px' }}>Recipient</th>
                    <th style={{ padding: '12px' }}>Subject</th>
                    <th style={{ padding: '12px' }}>Body Preview</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{log.recipientEmail}</td>
                      <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{log.subject}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.body}>{log.body}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '3px', fontWeight: 600, backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', textTransform: 'uppercase' }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {emailLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No email notification logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. HOME PAGE MANAGER */}
      {activeTab === 'homepage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Instagram Feed Section */}
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <Globe size={20} style={{ color: 'var(--gold-primary)' }} />
              <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>Instagram Social Feed</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Paste Instagram post or reel URLs below. Thumbnails are fetched automatically and displayed on the home page. Clicking a reel opens a video player modal.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                value={igUrlInput}
                onChange={e => setIgUrlInput(e.target.value)}
                placeholder="https://www.instagram.com/reel/... or /p/..."
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInstagramUrl(); } }}
                style={{ flex: 1, border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
              <button
                className="gold-button"
                onClick={addInstagramUrl}
                disabled={igLoading}
                style={{ padding: '10px 20px', fontSize: '0.8rem', opacity: igLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {igLoading ? 'Fetching...' : <><Plus size={14} /> Add</>}
              </button>
            </div>

            {igFeedUrls.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0', textAlign: 'center' }}>
                No Instagram posts added yet. Paste a URL above to get started.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {igFeedUrls.map((item, idx) => (
                  <div key={item.url} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: item.type === 'reel' ? 'rgba(131,39,41,0.88)' : 'var(--gold-primary)' }}>
                          {item.type === 'reel' ? 'Reel' : item.type === 'post' ? 'Post' : 'Link'}
                        </span>
                        {item.title && <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>}
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <button onClick={() => moveInstagramUrl(idx, -1)} disabled={idx === 0} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '4px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center' }} title="Move up">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => moveInstagramUrl(idx, 1)} disabled={idx === igFeedUrls.length - 1} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '4px', cursor: idx === igFeedUrls.length - 1 ? 'default' : 'pointer', opacity: idx === igFeedUrls.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center' }} title="Move down">
                        <ArrowDown size={12} />
                      </button>
                      <button onClick={() => removeInstagramUrl(item.url)} style={{ background: 'none', border: '1px solid #e74c3c', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#e74c3c', display: 'flex', alignItems: 'center' }} title="Remove">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Home Categories Manager */}
          <div className="glass" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <Home size={20} style={{ color: 'var(--gold-primary)' }} />
              <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>Shop By Category Cards</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Add new category cards to the home page. Each card needs a name, short description, and image URL.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '10px', alignItems: 'end', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Category Name</label>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Rings" style={{ width: '100%', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Short Description</label>
                <input value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} placeholder="e.g. Minimalist & Bold" style={{ width: '100%', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Image URL</label>
                <input value={newCatImage} onChange={e => setNewCatImage(e.target.value)} placeholder="https://images.unsplash.com/..." style={{ width: '100%', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
              <button
                className="gold-button"
                onClick={() => {
                  if (newCatName.trim() && newCatImage.trim()) {
                    setHomeCategories([...homeCategories, { id: newCatName.trim().toLowerCase().replace(/\s+/g, '_'), name: newCatName.trim(), desc: newCatDesc.trim() || 'Explore collection', image: newCatImage.trim() }]);
                    setNewCatName(''); setNewCatDesc(''); setNewCatImage('');
                    showToast('Category card added. Save settings to apply.', 'success');
                  }
                }}
                style={{ padding: '10px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {homeCategories.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {homeCategories.map((cat, idx) => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                    <img src={cat.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cat.desc}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                      <button onClick={() => { const arr = [...homeCategories]; if (idx > 0) { [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; setHomeCategories(arr); } }} disabled={idx === 0} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '3px', padding: '3px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, display: 'flex' }}>
                        <ArrowUp size={10} />
                      </button>
                      <button onClick={() => { const arr = [...homeCategories]; if (idx < arr.length - 1) { [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]; setHomeCategories(arr); } }} disabled={idx === homeCategories.length - 1} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '3px', padding: '3px', cursor: idx === homeCategories.length - 1 ? 'default' : 'pointer', opacity: idx === homeCategories.length - 1 ? 0.3 : 1, display: 'flex' }}>
                        <ArrowDown size={10} />
                      </button>
                      <button onClick={() => setHomeCategories(homeCategories.filter((_, i) => i !== idx))} style={{ background: 'none', border: '1px solid #e74c3c', borderRadius: '3px', padding: '3px', cursor: 'pointer', color: '#e74c3c', display: 'flex' }}>
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
                No custom categories added. Default categories will be shown on the home page.
              </p>
            )}
          </div>

          {/* Product Selectors — New Arrivals / Best Sellers / Trending */}
          {[
            { label: 'New Arrivals', sub: 'Products shown in the "New Arrivals" section on the home page.', ids: newArrivalsIds, setIds: setNewArrivalsIds, emptyMsg: 'No products selected. All products will be shown as fallback.' },
            { label: 'Best Sellers', sub: 'Products shown in the "Best Sellers" section. If empty, products with rating ≥ 4.8 are shown.', ids: bestSellersIds, setIds: setBestSellersIds, emptyMsg: 'No products selected. Top-rated products will be shown as fallback.' },
            { label: 'Trending', sub: 'Products shown in the "Trending Collection" section. If empty, a default set is shown.', ids: trendingIds, setIds: setTrendingIds, emptyMsg: 'No products selected. Default trending products will be shown as fallback.' },
          ].map(section => (
            <div key={section.label} className="glass" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <Home size={20} style={{ color: 'var(--gold-primary)' }} />
                <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-primary)' }}>{section.label}</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{section.sub}</p>

              {section.ids.length > 0 && (
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Selected ({section.ids.length})</span>
                  {section.ids.map((pid, idx) => {
                    const prod = products.find(p => p.id === pid);
                    if (!prod) return null;
                    return (
                      <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                        <img src={prod.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>₹{prod.price.toLocaleString('en-IN')} · {prod.category}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                          <button onClick={() => moveProductInList(section.ids, section.setIds, idx, -1)} disabled={idx === 0} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '3px', padding: '3px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, display: 'flex' }}>
                            <ArrowUp size={10} />
                          </button>
                          <button onClick={() => moveProductInList(section.ids, section.setIds, idx, 1)} disabled={idx === section.ids.length - 1} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '3px', padding: '3px', cursor: idx === section.ids.length - 1 ? 'default' : 'pointer', opacity: idx === section.ids.length - 1 ? 0.3 : 1, display: 'flex' }}>
                            <ArrowDown size={10} />
                          </button>
                          <button onClick={() => toggleProductInList(section.ids, section.setIds, pid)} style={{ background: 'none', border: '1px solid #e74c3c', borderRadius: '3px', padding: '3px', cursor: 'pointer', color: '#e74c3c', display: 'flex' }}>
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {section.ids.length === 0 && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>{section.emptyMsg}</p>
              )}

              <details>
                <summary style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', cursor: 'pointer', fontWeight: 500, marginBottom: '10px' }}>Browse & add products</summary>
                <div style={{ marginTop: '8px' }}>
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      value={homepageSearch}
                      onChange={e => setHomepageSearch(e.target.value)}
                      placeholder="Search by name, ID, or category..."
                      style={{ width: '100%', border: '1px solid var(--border-light)', padding: '8px 8px 8px 32px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {homepageSearchResults.map(prod => {
                      const isSelected = section.ids.includes(prod.id);
                      return (
                        <button
                          key={prod.id}
                          onClick={() => toggleProductInList(section.ids, section.setIds, prod.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', border: isSelected ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                            borderRadius: '6px', cursor: 'pointer', backgroundColor: isSelected ? 'var(--gold-light)' : 'var(--bg-primary)',
                            textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-primary)', transition: 'all 0.15s'
                          }}
                        >
                          <img src={prod.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '3px', objectFit: 'cover' }} />
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>₹{prod.price.toLocaleString('en-IN')}</span>
                          {isSelected && <Check size={12} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </details>
            </div>
          ))}

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="gold-button"
              onClick={saveHomepageSettings}
              disabled={isSavingHomepage}
              style={{ padding: '12px 32px', fontSize: '0.85rem', opacity: isSavingHomepage ? 0.6 : 1 }}
            >
              {isSavingHomepage ? 'Saving...' : 'Save Home Page Settings'}
            </button>
          </div>
        </div>
      )}

      {/* 8. SETTINGS */}
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
              </div>
            </div>
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Coupon & Promotion Manager</h5>
              <form onSubmit={addCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr auto', gap: '10px', alignItems: 'end' }}>
                  <input required value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Code (e.g. FESTIVE20)" style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                  <select value={couponType} onChange={e => setCouponType(e.target.value as 'percent' | 'fixed')} style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="percent">% Discount</option>
                    <option value="fixed">₹ Fixed Amount</option>
                  </select>
                  <input type="number" min="1" value={couponValue} onChange={e => setCouponValue(Number(e.target.value))} placeholder={couponType === 'percent' ? '% off (e.g. 10)' : '₹ off (e.g. 200)'} style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                  <input type="number" min="0" value={couponMinOrder} onChange={e => setCouponMinOrder(Number(e.target.value))} placeholder="Min order ₹" style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                  <button className="gold-button" style={{ padding: '10px 16px', fontSize: '.75rem' }}>Create</button>
                </div>
                <input value={couponDescription} onChange={e => setCouponDescription(e.target.value)} placeholder="Description shown to customers (e.g. Flat 10% off on orders above ₹999)" style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </form>

              {/* Coupon list */}
              {coupons.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '16px' }}>No coupons created yet.</p>
              ) : (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {coupons.map(c => (
                    <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: '6px', opacity: c.active ? 1 : 0.5, backgroundColor: 'var(--bg-secondary)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{c.code}</strong>
                          <span style={{ background: 'var(--gold-light)', color: 'var(--gold-primary)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px', fontWeight: 600, textTransform: 'uppercase' }}>
                            {c.type === 'fixed' ? `₹${c.value} OFF` : `${c.value}% OFF`}
                          </span>
                          {c.minOrder > 0 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Min ₹{c.minOrder.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        {c.description && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.3 }}>{c.description}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={async () => { await saveCoupon({ ...c, active: !c.active }); showToast(`Coupon "${c.code}" ${c.active ? 'disabled' : 'enabled'}.`, 'success'); }} style={{ cursor: 'pointer', color: 'var(--gold-primary)', background: 'none', border: '1px solid var(--gold-primary)', borderRadius: '4px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {c.active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={async () => { if (window.confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) { await deleteCoupon(c.code); showToast(`Coupon "${c.code}" deleted.`, 'success'); } }} style={{ cursor: 'pointer', color: '#e74c3c', background: 'none', border: '1px solid #e74c3c', borderRadius: '4px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
    </div>
  );
};
