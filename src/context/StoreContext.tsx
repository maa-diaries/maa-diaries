import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { databaseService } from '../services/database';
import type { Order, OrderItem, Inquiry, ProductReview, Coupon, SiteSettings } from '../services/database';
import { defaultSiteSettings } from '../services/siteSettings';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface CartItem {
  key: string; // composite key: id-metal-stone-engraving
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  quantity: number;
  selectedMetal: string;
  selectedStone: string;
  customEngraving?: string;
  isCustomRing?: boolean;
  customDetails?: {
    metal: string;
    cut: string;
    carat: number;
    engraving: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface StoreContextType {
  products: Product[];
  refreshProducts: () => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'key'>) => void;
  removeFromCart: (key: string) => void;
  updateCartQuantity: (key: string, qty: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  orders: Order[];
  refreshOrders: () => void;
  placeOrder: (shipping: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    estimatedDelivery: string;
    courierPartner: string;
    shippingCost: number;
    appliedCouponCode?: string;
  }, paymentMethod: 'COD' | 'Online', paymentStatus: 'Pending' | 'Paid', txnid?: string) => Promise<Order>;
  inquiries: Inquiry[];
  refreshInquiries: () => void;
  submitInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt'>) => Promise<Inquiry>;
  
  activePage: 'home' | 'about' | 'shop' | 'contact' | 'faq' | 'account' | 'tracking' | 'admin' | 'product-details' | 'orders';
  setActivePage: (page: 'home' | 'about' | 'shop' | 'contact' | 'faq' | 'account' | 'tracking' | 'admin' | 'product-details' | 'orders') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  triggerGemRain: boolean;
  setTriggerGemRain: (trigger: boolean) => void;
  shopCategory: string;
  setShopCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  
  currentUser: UserProfile | null;
  loginUser: (emailOrPhone: string, password?: string) => Promise<boolean>;
  registerUser: (profile: UserProfile, password?: string, skipVerification?: boolean) => Promise<{ success: boolean; needsVerification?: boolean; verificationCode?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  logoutUser: () => void;
  getProductReviews: (productId: string) => Promise<ProductReview[]>;
  submitProductReview: (review: Omit<ProductReview, 'id' | 'createdAt'>) => Promise<ProductReview>;
  sendEmailViaResend: (type: 'order' | 'feedback' | 'review' | 'delivery_update' | 'welcome' | 'verification' | 'reset_password', payload: any) => Promise<void>;
  categories: string[];
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  resetAndSeedProducts: () => Promise<void>;
  siteSettings: SiteSettings;
  refreshSiteSettings: () => Promise<void>;
  saveSiteSettings: (settings: SiteSettings) => Promise<void>;
  coupons: Coupon[];
  refreshCoupons: () => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  mediaItems: { id: string; url: string; name: string; createdAt: string; }[];
  refreshMedia: () => Promise<void>;
  addMedia: (url: string, name: string) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  emailLogs: { id: string; recipientEmail: string; subject: string; body: string; status: string; createdAt: string; }[];
  refreshEmailLogs: () => Promise<void>;
  triggerEmailNotification: (recipientEmail: string, subject: string, body: string) => Promise<void>;
  replyToReview: (reviewId: string, replyComment: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [mediaItems, setMediaItems] = useState<{ id: string; url: string; name: string; createdAt: string; }[]>([]);
  const [emailLogs, setEmailLogs] = useState<{ id: string; recipientEmail: string; subject: string; body: string; status: string; createdAt: string; }[]>([]);
  
  // UI States
  const [activePage, setActivePageState] = useState<'home' | 'about' | 'shop' | 'contact' | 'faq' | 'account' | 'tracking' | 'admin' | 'product-details' | 'orders'>('home');

  // Load current user from localStorage on mount + listen for Supabase auth changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Restore from localStorage first (fast) in mock/no-supabase mode
      const savedUser = localStorage.getItem('md_current_user_v1');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse current user", e);
        }
      }
      return;
    }

    // If Supabase is configured, ALWAYS check session, do NOT trust localStorage
    supabase.auth.getSession().then(({ data }: any) => {
      if (data.session?.user) {
        databaseService.getUserByEmail(data.session.user.email!).then(profile => {
          if (profile) {
            setCurrentUser(profile);
          } else {
            setCurrentUser(null);
          }
        }).catch(() => setCurrentUser(null));
      } else {
        setCurrentUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (session?.user) {
        const profile = await databaseService.getUserByEmail(session.user.email!);
        if (profile) {
          setCurrentUser(profile);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginUser = async (emailOrPhone: string, password?: string): Promise<boolean> => {
    if (!password) {
      throw new Error("Password is required for login.");
    }

    const key = `md_lockout_${emailOrPhone.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    let record = stored ? JSON.parse(stored) : { attempts: 0, lockoutUntil: null };

    if (record.lockoutUntil && Date.now() < record.lockoutUntil) {
      const remainingMinutes = Math.ceil((record.lockoutUntil - Date.now()) / 60000);
      throw new Error(`This account is locked out due to multiple failed login attempts. Please try again in ${remainingMinutes} minutes.`);
    }

    const isEmail = emailOrPhone.includes('@');

    if (!isSupabaseConfigured) {
      throw new Error("Authentication requires Supabase configuration.");
    }

    const { error } = isEmail
      ? await supabase.auth.signInWithPassword({ email: emailOrPhone, password })
      : await supabase.auth.signInWithPassword({ phone: emailOrPhone, password } as any);
      
    if (!error) {
      // Reset lockout attempts on successful login
      localStorage.removeItem(key);
      
      let targetEmail = isEmail ? emailOrPhone : '';
      if (!isEmail) {
        const profile = await databaseService.getUserByPhone(emailOrPhone);
        if (profile) targetEmail = profile.email;
      }
      
      if (targetEmail) {
        let profile = await databaseService.getUserByEmail(targetEmail);
        if (!profile) {
          if (targetEmail.toLowerCase() === 'founder@maadiaries.com') {
            const adminProfile: UserProfile = {
              name: 'Founder',
              email: 'founder@maadiaries.com',
              phone: '0000000000',
              addressLine: 'D-16, Part 1, Chanakya Place, 40 Feet Road, Opp. Gurudwara',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110059'
            };
            try {
              await databaseService.registerUserProfile(adminProfile);
              profile = adminProfile;
            } catch (e) {
              console.error("Could not register default admin profile:", e);
            }
          } else {
            // Auto-heal missing profile from user metadata on successful auth
            const { data: authData } = await supabase.auth.getUser();
            if (authData?.user) {
              const u = authData.user;
              const healedProfile: UserProfile = {
                name: u.user_metadata?.name || u.email || 'Customer',
                email: u.email || targetEmail,
                phone: u.user_metadata?.phone || '',
                addressLine: u.user_metadata?.address_line || '',
                city: u.user_metadata?.city || '',
                state: u.user_metadata?.state || '',
                pincode: u.user_metadata?.pincode || ''
              };
              try {
                await databaseService.registerUserProfile(healedProfile);
                profile = healedProfile;
              } catch (e) {
                console.error("Could not auto-heal user profile:", e);
              }
            }
          }
        }
        if (profile) {
          setCurrentUser(profile);
          return true;
        }
      }
    } else {
      record.attempts += 1;
      if (record.attempts >= 5) {
        record.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 mins lockout
      }
      localStorage.setItem(key, JSON.stringify(record));
      throw new Error(error.message);
    }
    return false;
  };

  const registerUser = async (profile: UserProfile, password?: string, skipVerification = false): Promise<{ success: boolean; needsVerification?: boolean; verificationCode?: string; message?: string }> => {
    if (!skipVerification) {
      // 1. Check if user already exists
      const existingEmail = await databaseService.getUserByEmail(profile.email);
      if (existingEmail) {
        return { success: false, message: "This email is already registered. Please log in instead." };
      }
      if (profile.phone) {
        const existingPhone = await databaseService.getUserByPhone(profile.phone);
        if (existingPhone) {
          return { success: false, message: "This phone number is already registered." };
        }
      }

      // 2. Generate custom 6-digit OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // 3. Send verification email via Resend
      try {
        await sendEmailViaResend('verification', { name: profile.name, email: profile.email, code });
        return {
          success: true,
          needsVerification: true,
          verificationCode: code,
          message: "A 6-digit verification code has been sent to your email. Please enter it to complete registration."
        };
      } catch (err: any) {
        return { success: false, message: "Failed to send verification email: " + (err.message || err) };
      }
    }

    if (isSupabaseConfigured && profile.email) {
      // 1. Create Supabase Auth user with full metadata
      const { error: authError } = await supabase.auth.signUp({
        email: profile.email,
        password: password || crypto.randomUUID(), // random password if none provided
        options: {
          data: {
            name: profile.name,
            phone: profile.phone,
            address_line: profile.addressLine,
            city: profile.city,
            state: profile.state,
            pincode: profile.pincode
          }
        }
      });
      if (authError) {
        return { success: false, message: authError.message };
      }

      // 2. Save profile to registered_users table (only if verification is disabled/already logged in)
      const profileSaved = await databaseService.registerUserProfile(profile);
      if (!profileSaved) {
        return { success: false, message: "Failed to store customer profile." };
      }

      setCurrentUser(profile);
      localStorage.setItem('md_current_user_v1', JSON.stringify(profile));
      // Dispatch welcome email via Resend
      sendEmailViaResend('welcome', { name: profile.name, email: profile.email }).catch(err => {
        console.warn("Failed to send welcome email:", err);
      });
      return { success: true };
    }

    // Fallback without Supabase Auth
    const profileSaved = await databaseService.registerUserProfile(profile);
    if (profileSaved) {
      setCurrentUser(profile);
      localStorage.setItem('md_current_user_v1', JSON.stringify(profile));
      // Dispatch welcome email via Resend
      sendEmailViaResend('welcome', { name: profile.name, email: profile.email }).catch(err => {
        console.warn("Failed to send welcome email:", err);
      });
      return { success: true };
    }
    return { success: false, message: "Registration failed." };
  };

  const logoutUser = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('md_current_user_v1');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, message: 'Password reset is not available in demo mode.' };
    }
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'reset_password',
          payload: {
            email,
            origin: window.location.origin
          }
        })
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        return { success: false, message: result.error || 'Failed to send reset email.' };
      }
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send reset email.' };
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    if (order.status !== 'Pending' && order.status !== 'Confirmed') return false;
    if (currentUser && order.customerEmail !== currentUser.email && order.customerPhone !== currentUser.phone) {
      return false;
    }
    await databaseService.updateOrderStatus(orderId, 'Cancelled');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as const } : o));
    return true;
  };
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [triggerGemRain, setTriggerGemRain] = useState(false);
  const [shopCategory, setShopCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync scroll positions when navigating pages
  const setActivePage = (page: typeof activePage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActivePageState(page);
  };

  // Load initial data
  const refreshProducts = async () => {
    const data = await databaseService.getProducts();
    setProducts(data);
  };

  const refreshOrders = async () => {
    const data = await databaseService.getOrders();
    setOrders(data);
  };

  const refreshInquiries = async () => {
    const data = await databaseService.getInquiries();
    setInquiries(data);
  };

  const refreshCategories = async () => {
    const data = await databaseService.getCategories();
    setCategories(data);
  };

  const addCategory = async (name: string) => {
    await databaseService.addCategory(name);
    await refreshCategories();
  };

  const deleteCategory = async (name: string) => {
    await databaseService.deleteCategory(name);
    await refreshCategories();
  };

  const resetAndSeedProducts = async () => {
    await databaseService.resetAndSeedProducts();
    await refreshProducts();
  };

  const refreshSiteSettings = async () => {
    const data = await databaseService.getSiteSettings();
    setSiteSettings(data);
  };

  const saveSiteSettings = async (settings: SiteSettings) => {
    await databaseService.saveSiteSettings(settings);
    await refreshSiteSettings();
  };

  const refreshCoupons = async () => {
    const data = await databaseService.getCoupons();
    setCoupons(data);
    // Seed default coupons if none exist
    if (data.length === 0) {
      const defaults: Coupon[] = [
        { code: 'FREE1000', type: 'fixed', value: 99, minOrder: 1000, active: true, description: 'FREE Express Delivery on orders above ₹1,000' },
        { code: 'LOYALGIFT', type: 'fixed', value: 149, minOrder: 500, active: true, description: 'Complimentary luxury surprise gift on your first order' },
      ];
      for (const d of defaults) {
        await databaseService.saveCoupon(d);
      }
      const seeded = await databaseService.getCoupons();
      setCoupons(seeded);
    }
  };

  const saveCoupon = async (coupon: Coupon) => {
    await databaseService.saveCoupon(coupon);
    await refreshCoupons();
  };

  const deleteCoupon = async (code: string) => {
    await databaseService.deleteCoupon(code);
    await refreshCoupons();
  };

  const refreshMedia = async () => {
    const data = await databaseService.getMedia();
    setMediaItems(data);
  };

  const addMedia = async (url: string, name: string) => {
    await databaseService.addMedia(url, name);
    await refreshMedia();
  };

  const deleteMedia = async (id: string) => {
    await databaseService.deleteMedia(id);
    await refreshMedia();
  };

  const refreshEmailLogs = async () => {
    const data = await databaseService.getEmailLogs();
    setEmailLogs(data);
  };

  const triggerEmailNotification = async (recipientEmail: string, subject: string, body: string) => {
    await databaseService.logEmailNotification(recipientEmail, subject, body, 'sent');
    await refreshEmailLogs();
  };

  const replyToReview = async (reviewId: string, replyComment: string) => {
    await databaseService.replyToReview(reviewId, replyComment);
    await refreshProducts();
  };

  useEffect(() => {
    // Migration/Cache Invalidation: Clear old cached site settings containing obsolete address or brand messaging
    try {
      const oldSettings = localStorage.getItem('md_site_settings');
      if (oldSettings && (oldSettings.includes('New Delhi, India') || oldSettings.includes('Rolled Gold'))) {
        localStorage.removeItem('md_site_settings');
      }
      const oldSettingsV1 = localStorage.getItem('md_site_settings_v1');
      if (oldSettingsV1 && (oldSettingsV1.includes('New Delhi, India') || oldSettingsV1.includes('Rolled Gold'))) {
        localStorage.removeItem('md_site_settings_v1');
      }
    } catch (e) {
      console.warn('Failed to clear old localStorage settings cache:', e);
    }

    refreshProducts();
    refreshOrders();
    refreshInquiries();
    refreshCategories();
    refreshSiteSettings();
    refreshCoupons();
    refreshMedia();
    refreshEmailLogs();
    
    // Load cart/wishlist from localStorage
    try {
      const savedCart = localStorage.getItem('md_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      setCart([]);
    }
    
    try {
      const savedWish = localStorage.getItem('md_wishlist');
      if (savedWish) setWishlist(JSON.parse(savedWish));
    } catch {
      setWishlist([]);
    }
  }, []);

  // Save cart/wishlist to localStorage on changes
  useEffect(() => {
    localStorage.setItem('md_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('md_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart operations
  const addToCart = (itemData: Omit<CartItem, 'key'>) => {
    // Create unique key based on item details
    const key = `${itemData.product.id}-${itemData.selectedMetal.replace(/\s+/g, '')}-${itemData.selectedStone.replace(/\s+/g, '')}-${itemData.customEngraving || ''}`;
    
    const product = products.find(p => p.id === itemData.product.id);
    const availableStock = product?.stock ?? 999;
    
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.key === key);
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        const newQty = currentQty + itemData.quantity;
        if (newQty > availableStock) {
          alert(`Cannot add more of this item. Only ${availableStock} left in stock.`);
          const updated = [...prevCart];
          updated[existingIndex].quantity = availableStock;
          return updated;
        }
        const updated = [...prevCart];
        updated[existingIndex].quantity = newQty;
        return updated;
      }
      if (itemData.quantity > availableStock) {
        alert(`Cannot add this item. Only ${availableStock} left in stock.`);
        return prevCart;
      }
      return [...prevCart, { ...itemData, key }];
    });
  };

  const removeFromCart = (key: string) => {
    setCart(prevCart => prevCart.filter(item => item.key !== key));
  };

  const updateCartQuantity = (key: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(key);
      return;
    }
    const item = cart.find(i => i.key === key);
    if (!item) return;
    const product = products.find(p => p.id === item.product.id);
    const availableStock = product?.stock ?? 999;
    
    if (qty > availableStock) {
      alert(`Only ${availableStock} items are available in stock.`);
      qty = availableStock;
    }
    
    setCart(prevCart =>
      prevCart.map(item => (item.key === key ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const sendEmailViaResend = async (type: 'order' | 'feedback' | 'review' | 'delivery_update' | 'welcome' | 'verification' | 'reset_password', payload: any) => {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    });
    if (!response.ok) {
      let errorMessage = `Email server response failed with code: ${response.status}`;
      try {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (data && data.error) {
            errorMessage = data.error;
          }
        } catch {
          if (text && text.length < 300) {
            errorMessage = text;
          }
        }
      } catch (e) {}
      throw new Error(errorMessage);
    }
  };

  // Orders
  const placeOrder = async (
    shipping: Parameters<StoreContextType['placeOrder']>[0],
    paymentMethod: 'COD' | 'Online',
    paymentStatus: 'Pending' | 'Paid',
    txnid?: string
  ) => {
    const { appliedCouponCode, ...shippingAddress } = shipping;

    const items: OrderItem[] = cart.map(c => ({
      product: {
        id: c.product.id,
        name: c.product.name,
        price: c.product.price,
        image: c.product.image,
        category: c.product.category
      },
      quantity: c.quantity,
      selectedMetal: c.selectedMetal,
      selectedStone: c.selectedStone,
      customEngraving: c.customEngraving,
      isCustomRing: c.isCustomRing,
      customDetails: c.customDetails
    }));

    let discountAmount = 0;
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    if (appliedCouponCode) {
      const coupon = await databaseService.getCouponByCode(appliedCouponCode);
      if (!coupon || !coupon.active || subtotal < coupon.minOrder) {
        throw new Error('Invalid or expired coupon code.');
      }
      if (coupon.type === 'percent') {
        discountAmount = Math.round(subtotal * (coupon.value / 100));
      } else {
        discountAmount = Math.min(coupon.value, subtotal);
      }
    } else if (subtotal > 999) {
      discountAmount = Math.round(subtotal * 0.1);
    }

    const totalAmount = subtotal - discountAmount + shipping.shippingCost;

    // Validate stock availability before creating order
    for (const item of cart) {
      const product = products.find(p => p.id === item.product.id);
      if (product && product.stock !== undefined && product.stock < item.quantity) {
        throw new Error(`Sorry, "${product.name}" only has ${product.stock} items left in stock.`);
      }
    }

    try {
      const newOrder = await databaseService.placeOrder({
        ...shippingAddress,
        paymentMethod,
        paymentStatus,
        items,
        totalAmount,
        status: 'Pending',
        txnid
      });

      clearCart();
      await refreshOrders();
      setTriggerGemRain(true); // Fire diamond shower!

      // Stock decrement is handled automatically via database trigger on order insert
      await refreshProducts();

      // Dispatch order receipt/alert emails via Resend
      try {
        await sendEmailViaResend('order', { order: newOrder });
      } catch (emailErr) {
        console.warn("Order placed, but failed to send confirmation email:", emailErr);
      }

      return newOrder;
    } catch (error: any) {
      if (txnid && (error?.code === '23505' || error?.message?.includes('unique constraint') || error?.message?.includes('23505'))) {
        console.warn("Order with txnid already exists, returning existing order.");
        const existingOrder = await databaseService.getOrderByTxnid(txnid);
        if (existingOrder) {
          return existingOrder;
        }
      }
      throw error;
    }
  };

  // Inquiries
  const submitInquiry = async (inquiryInfo: Omit<Inquiry, 'id' | 'createdAt'>) => {
    const newInquiry = await databaseService.submitInquiry(inquiryInfo);
    await refreshInquiries();

    // Dispatch feedback alert to the owner via Resend
    await sendEmailViaResend('feedback', {
      name: newInquiry.name,
      email: newInquiry.email,
      phone: newInquiry.phone,
      message: newInquiry.message,
      orderId: newInquiry.orderId
    });

    return newInquiry;
  };

  // Product Reviews
  const getProductReviews = async (productId: string) => {
    return await databaseService.getProductReviews(productId);
  };

  const submitProductReview = async (reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const newReview = await databaseService.submitProductReview(reviewData);
    
    // Dispatch review notification to owner via Resend
    await sendEmailViaResend('review', {
      productName: products.find(p => p.id === reviewData.productId)?.name || 'Unknown Product',
      userName: reviewData.userName,
      rating: reviewData.rating,
      comment: reviewData.comment
    });

    await refreshProducts(); // update count and rating
    return newReview;
  };

  return (
    <StoreContext.Provider value={{
      products,
      refreshProducts,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      orders,
      refreshOrders,
      placeOrder,
      inquiries,
      refreshInquiries,
      submitInquiry,
      activePage,
      setActivePage,
      selectedProductId,
      setSelectedProductId,
      cartOpen,
      setCartOpen,
      checkoutOpen,
      setCheckoutOpen,
      triggerGemRain,
      setTriggerGemRain,
      shopCategory,
      setShopCategory,
      searchQuery,
      setSearchQuery,
      selectedOrderId,
      setSelectedOrderId,
      currentUser,
      loginUser,
      registerUser,
      resetPassword,
      cancelOrder,
      logoutUser,
      getProductReviews,
      submitProductReview,
      sendEmailViaResend,
      categories,
      addCategory,
      deleteCategory,
      refreshCategories,
      resetAndSeedProducts,
      siteSettings,
      refreshSiteSettings,
      saveSiteSettings,
      coupons,
      refreshCoupons,
      saveCoupon,
      deleteCoupon,
      mediaItems,
      refreshMedia,
      addMedia,
      deleteMedia,
      emailLogs,
      refreshEmailLogs,
      triggerEmailNotification,
      replyToReview
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
