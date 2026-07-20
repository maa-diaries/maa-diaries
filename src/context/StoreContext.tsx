import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { databaseService } from '../services/database';
import type { Order, OrderItem, Inquiry, ProductReview } from '../services/database';

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
  password?: string;
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
  }, paymentMethod: 'COD' | 'Online', paymentStatus: 'Pending' | 'Paid') => Promise<Order>;
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
  registerUser: (profile: UserProfile) => Promise<boolean>;
  logoutUser: () => void;
  getProductReviews: (productId: string) => Promise<ProductReview[]>;
  submitProductReview: (review: Omit<ProductReview, 'id' | 'createdAt'>) => Promise<ProductReview>;
  sendEmailViaResend: (type: 'order' | 'feedback' | 'review', payload: any) => Promise<void>;
  categories: string[];
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  resetAndSeedProducts: () => Promise<void>;
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
  
  // UI States
  const [activePage, setActivePageState] = useState<'home' | 'about' | 'shop' | 'contact' | 'faq' | 'account' | 'tracking' | 'admin' | 'product-details' | 'orders'>('home');

  // Load current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('md_current_user_v1');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse current user", e);
      }
    }
  }, []);

  const loginUser = async (emailOrPhone: string, password?: string): Promise<boolean> => {
    const users = await databaseService.getUsers();
    const foundUser = users.find(u => 
      (u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone) &&
      (!password || u.password === password)
    );
    
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem('md_current_user_v1', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const registerUser = async (profile: UserProfile): Promise<boolean> => {
    const success = await databaseService.registerUser(profile);
    if (success) {
      setCurrentUser(profile);
      localStorage.setItem('md_current_user_v1', JSON.stringify(profile));
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('md_current_user_v1');
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

  useEffect(() => {
    refreshProducts();
    refreshOrders();
    refreshInquiries();
    refreshCategories();
    
    // Load cart/wishlist from localStorage
    const savedCart = localStorage.getItem('md_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const savedWish = localStorage.getItem('md_wishlist');
    if (savedWish) setWishlist(JSON.parse(savedWish));
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
    
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.key === key);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += itemData.quantity;
        return updated;
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

  // Email service helper via Resend Vercel Serverless Function
  const sendEmailViaResend = async (type: 'order' | 'feedback' | 'review', payload: any) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
      if (!response.ok) {
        throw new Error(`Email server response failed with code: ${response.status}`);
      }
      console.log(`Resend: Successfully dispatched ${type} email.`);
    } catch (err) {
      console.warn("Resend email request simulation (Local Dev Mode):", { type, payload }, err);
    }
  };

  // Orders
  const placeOrder = async (
    shipping: Parameters<StoreContextType['placeOrder']>[0],
    paymentMethod: 'COD' | 'Online',
    paymentStatus: 'Pending' | 'Paid'
  ) => {
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

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + shipping.shippingCost;

    const newOrder = await databaseService.placeOrder({
      ...shipping,
      paymentMethod,
      paymentStatus,
      items,
      totalAmount,
      status: 'Pending'
    });

    clearCart();
    await refreshOrders();
    setTriggerGemRain(true); // Fire diamond shower!

    // Dispatch order receipt/alert emails via Resend
    await sendEmailViaResend('order', { order: newOrder });

    return newOrder;
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
      logoutUser,
      getProductReviews,
      submitProductReview,
      sendEmailViaResend,
      categories,
      addCategory,
      deleteCategory,
      refreshCategories,
      resetAndSeedProducts
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
