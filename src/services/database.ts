import { INITIAL_PRODUCTS } from '../data/products';
import type { Product } from '../data/products';
import { supabase, isSupabaseConfigured } from './supabase';
import { type Coupon } from './coupons';
import { type SiteSettings } from './siteSettings';
export type { Coupon, SiteSettings };

const generateId = () => crypto.randomUUID().slice(0, 12);

export interface OrderItem {
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

export interface Order {
  id: string;
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
  paymentMethod: 'COD' | 'Online';
  paymentStatus: 'Pending' | 'Paid';
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  txnid?: string;
  payuId?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  orderId?: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  replyComment?: string;
  repliedAt?: string;
}


// Mappers for Supabase
const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  category: row.category || 'earrings',
  subcategory: row.subcategory || undefined,
  price: Number(row.price),
  originalPrice: row.original_price ? Number(row.original_price) : undefined,
  discount: row.discount ? Number(row.discount) : undefined,
  image: (row.image || '').replace(/^\/?src\/assets\/products\//, '/products/').replace(/^\/?assets\/products\//, '/products/'),
  rating: Number(row.rating || 5.0),
  reviewsCount: Number(row.reviews_count || 0),
  metalOptions: row.metal_options || [],
  stoneOptions: row.stone_options || [],
  specs: row.specs || {
    metal: '',
    coating: '',
    stoneType: '',
    durability: '',
    finish: ''
  },
  isFeatured: Boolean(row.is_featured)
  ,stock: typeof row.stock === 'number' ? row.stock : undefined
  ,sku: row.sku || undefined
});

const mapOrder = (row: any): Order => ({
  id: row.id,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  addressLine: row.address_line,
  city: row.city,
  state: row.state,
  pincode: row.pincode,
  estimatedDelivery: row.estimated_delivery,
  courierPartner: row.courier_partner,
  shippingCost: Number(row.shipping_cost),
  paymentMethod: row.payment_method,
  paymentStatus: row.payment_status,
  items: row.items,
  totalAmount: Number(row.total_amount),
  status: row.status,
  trackingNumber: row.tracking_number || undefined,
  txnid: row.txnid || undefined,
  payuId: row.payu_id || undefined,
  createdAt: row.created_at
});

const mapInquiry = (row: any): Inquiry => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  message: row.message,
  orderId: row.order_id || undefined,
  createdAt: row.created_at
});

function validateOrderTotal(items: { product: { price: number }; quantity: number }[], shippingCost: number, submittedTotal: number): boolean {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const maxPossible = subtotal + shippingCost;
  return submittedTotal >= 0 && submittedTotal <= maxPossible + 1;
}

export const databaseService = {
  // --- Products API ---
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return INITIAL_PRODUCTS;
    }
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(mapProduct);
    }
    
    // Seed if table is empty
    const seeded = await this.seedProducts();
    return seeded;
  },

  async seedProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) return INITIAL_PRODUCTS;
    try {
      const dbRows = INITIAL_PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory || null,
        price: p.price,
        original_price: p.originalPrice || null,
        discount: p.discount || null,
        image: p.image,
        rating: p.rating,
        reviews_count: p.reviewsCount,
        metal_options: p.metalOptions,
        stone_options: p.stoneOptions,
        specs: p.specs,
        is_featured: p.isFeatured || false
      }));
      const { data, error } = await supabase
        .from('products')
        .insert(dbRows)
        .select('*');
      if (error) throw error;
      return (data || []).map(mapProduct);
    } catch (err) {
      console.error("Failed to seed products in Supabase:", err);
      return INITIAL_PRODUCTS;
    }
  },

  async resetAndSeedProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot reset products.");
    }
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '');
    if (deleteError) throw deleteError;
    return await this.seedProducts();
  },

  async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const id = `prod-${generateId()}`;
    const newProduct: Product = {
      ...productData,
      id,
      rating: 5.0,
      reviewsCount: 0
    };

    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot save product.");
    }
    const { error } = await supabase
      .from('products')
      .insert({
        id,
        name: productData.name,
        description: productData.description,
        category: productData.category,
        subcategory: productData.subcategory || null,
        price: productData.price,
        original_price: productData.originalPrice || null,
        discount: productData.discount || null,
        image: productData.image,
        rating: 5.0,
        reviews_count: 0,
        metal_options: productData.metalOptions,
        stone_options: productData.stoneOptions,
        specs: productData.specs,
        is_featured: productData.isFeatured || false
        ,stock: productData.stock ?? 0
        ,sku: productData.sku || null
      });
    if (error) throw error;
    return newProduct;
  },

  async updateProduct(updatedProduct: Product): Promise<Product> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot update product.");
    }
    const { error } = await supabase
      .from('products')
      .update({
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        subcategory: updatedProduct.subcategory || null,
        price: updatedProduct.price,
        original_price: updatedProduct.originalPrice || null,
        discount: updatedProduct.discount || null,
        image: updatedProduct.image,
        rating: updatedProduct.rating,
        reviews_count: updatedProduct.reviewsCount,
        metal_options: updatedProduct.metalOptions,
        stone_options: updatedProduct.stoneOptions,
        specs: updatedProduct.specs,
        is_featured: updatedProduct.isFeatured || false
        ,stock: updatedProduct.stock ?? 0
        ,sku: updatedProduct.sku || null
      })
      .eq('id', updatedProduct.id);
    if (error) throw error;
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot delete product.");
    }
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- Orders API ---
  async getOrders(): Promise<Order[]> {
    if (!isSupabaseConfigured) {
      return [];
    }
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrder);
  },

  async placeOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    if (!validateOrderTotal(orderData.items, orderData.shippingCost, orderData.totalAmount)) {
      throw new Error("Order total mismatch. Please try again.");
    }
    const id = `MD-${generateId()}`;
    const createdAt = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id,
      createdAt
    };

    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot place order.");
    }
    const { error } = await supabase
      .from('orders')
      .insert({
        id,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        address_line: orderData.addressLine,
        city: orderData.city,
        state: orderData.state,
        pincode: orderData.pincode,
        estimated_delivery: orderData.estimatedDelivery,
        courier_partner: orderData.courierPartner,
        shipping_cost: orderData.shippingCost,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentStatus,
        items: orderData.items,
        total_amount: orderData.totalAmount,
        status: 'Pending',
        tracking_number: orderData.trackingNumber || null,
        txnid: orderData.txnid || null,
        payu_id: orderData.payuId || null,
        created_at: createdAt
      });
    if (error) throw error;
    return newOrder;
  },

  async getOrderByTxnid(txnid: string): Promise<Order | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('txnid', txnid)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapOrder(data);
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot update order status.");
    }
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) throw error;
  },

  async updateOrderPaymentStatus(orderId: string, status: Order['paymentStatus']): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot update payment status.");
    }
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', orderId);
    if (error) throw error;
  },

  async updateOrderTrackingAndDelivery(orderId: string, trackingNumber: string, estimatedDelivery: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot update tracking details.");
    }
    const { error } = await supabase
      .from('orders')
      .update({ 
        tracking_number: trackingNumber || null,
        estimated_delivery: estimatedDelivery
      })
      .eq('id', orderId);
    if (error) throw error;
  },

  // --- Inquiries API ---
  async getInquiries(): Promise<Inquiry[]> {
    if (!isSupabaseConfigured) {
      return [];
    }
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapInquiry);
  },

  async submitInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
    const id = `INQ-${generateId()}`;
    const createdAt = new Date().toISOString();
    const newInquiry: Inquiry = {
      ...inquiryData,
      id,
      createdAt
    };

    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot submit inquiry.");
    }
    const { error } = await supabase
      .from('inquiries')
      .insert({
        id,
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        message: inquiryData.message,
        order_id: inquiryData.orderId || null,
        created_at: createdAt
      });
    if (error) throw error;
    return newInquiry;
  },

  // --- Users API ---
  async getUsers(): Promise<any[]> {
    if (!isSupabaseConfigured) {
      return [];
    }
    const { data, error } = await supabase
      .from('registered_users')
      .select('name, email, phone, address_line, city, state, pincode');
    if (error) throw error;
    return (data || []).map((row: any) => ({
      name: row.name,
      email: row.email,
      phone: row.phone,
      addressLine: row.address_line,
      city: row.city,
      state: row.state,
      pincode: row.pincode
    }));
  },

  async getUserByEmail(email: string): Promise<any | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('registered_users')
      .select('name, email, phone, address_line, city, state, pincode')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      addressLine: data.address_line,
      city: data.city,
      state: data.state,
      pincode: data.pincode
    };
  },

  async getUserByPhone(phone: string): Promise<any | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('registered_users')
      .select('name, email, phone, address_line, city, state, pincode')
      .eq('phone', phone)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      addressLine: data.address_line,
      city: data.city,
      state: data.state,
      pincode: data.pincode
    };
  },

  async registerUserProfile(profile: { name: string; email: string; phone: string; addressLine: string; city: string; state: string; pincode: string }): Promise<boolean> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot register user profile.");
    }
    // Check if profile already exists
    const existing = await this.getUserByEmail(profile.email);
    if (existing) return false;

    const { error } = await supabase
      .from('registered_users')
      .insert({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address_line: profile.addressLine,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode
      });
    if (error) throw error;
    return true;
  },

  // --- Product Reviews API ---
  async getAllReviews(): Promise<ProductReview[]> {
    if (!isSupabaseConfigured) {
      return [];
    }
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      userName: row.user_name,
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: row.created_at,
      replyComment: row.reply_comment || undefined,
      repliedAt: row.replied_at || undefined
    }));
  },

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    if (!isSupabaseConfigured) {
      return [];
    }
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      userName: row.user_name,
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: row.created_at,
      replyComment: row.reply_comment || undefined,
      repliedAt: row.replied_at || undefined
    }));
  },

  async submitProductReview(reviewData: Omit<ProductReview, 'id' | 'createdAt'>): Promise<ProductReview> {
    const id = `rev-${generateId()}`;
    const createdAt = new Date().toISOString();
    const newReview: ProductReview = {
      ...reviewData,
      id,
      createdAt
    };

    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot submit product review.");
    }
    const { error } = await supabase
      .from('product_reviews')
      .insert({
        id,
        product_id: reviewData.productId,
        user_name: reviewData.userName,
        rating: reviewData.rating,
        comment: reviewData.comment,
        created_at: createdAt
      });
    if (error) throw error;

    // Recalculate average rating & reviewsCount for the product
    const { data: productReviews } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', reviewData.productId);

    if (productReviews) {
      const avgRating = productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / productReviews.length;
      await supabase
        .from('products')
        .update({ rating: Math.round(avgRating * 10) / 10, reviews_count: productReviews.length })
        .eq('id', reviewData.productId);
    }

    return newReview;
  },

  async deleteProductReview(reviewId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot delete product review.");
    }
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);
    if (error) throw error;
  },

  // --- Categories API ---
  async getCategories(): Promise<string[]> {
    const defaultCategories = [
      'earrings',
      'necklaces',
      'bracelets',
      'pendants',
      'payals',
      'kashmiri_jhumke',
      'hair_accessories'
    ];
    const getLocal = () => {
      const local = localStorage.getItem('md_categories');
      return local ? JSON.parse(local) : defaultCategories;
    };
    if (!isSupabaseConfigured) return getLocal();
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name');
      if (error) throw error;
      if (data && data.length > 0) {
        const list = data.map((row: any) => row.name.toLowerCase());
        localStorage.setItem('md_categories', JSON.stringify(list));
        return list;
      } else {
        // Seed default categories into Supabase if empty
        await supabase.from('categories').insert(defaultCategories.map(name => ({ name })));
        localStorage.setItem('md_categories', JSON.stringify(defaultCategories));
        return defaultCategories;
      }
    } catch (err) {
      console.warn("Supabase getCategories failed, falling back to localStorage:", err);
      return getLocal();
    }
  },

  async addCategory(name: string): Promise<void> {
    const cleaned = name.trim().toLowerCase();
    const local = localStorage.getItem('md_categories');
    const list: string[] = local ? JSON.parse(local) : [];
    if (!list.includes(cleaned)) {
      list.push(cleaned);
      localStorage.setItem('md_categories', JSON.stringify(list));
    }
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: cleaned });
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase addCategory failed, saved to localStorage only:", err);
    }
  },

  async deleteCategory(name: string): Promise<void> {
    const cleaned = name.trim().toLowerCase();
    const local = localStorage.getItem('md_categories');
    if (local) {
      let list: string[] = JSON.parse(local);
      list = list.filter(cat => cat !== cleaned);
      localStorage.setItem('md_categories', JSON.stringify(list));
    }
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', cleaned);
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase deleteCategory failed, deleted from localStorage only:", err);
    }
  },

  async replyToReview(reviewId: string, replyComment: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({
          reply_comment: replyComment,
          replied_at: new Date().toISOString()
        })
        .eq('id', reviewId);
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase replyToReview failed:", err);
    }
  },

  async getCoupons(): Promise<Coupon[]> {
    const getLocal = () => {
      const local = localStorage.getItem('md_coupons');
      return local ? JSON.parse(local) : [];
    };
    if (!isSupabaseConfigured) return getLocal();
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (data || []).map((row: any) => ({
        code: row.code,
        type: row.type as 'percent' | 'fixed',
        value: Number(row.value),
        minOrder: Number(row.min_order || 0),
        active: Boolean(row.active),
        description: row.description || undefined
      }));
      localStorage.setItem('md_coupons', JSON.stringify(list));
      return list;
    } catch (err) {
      console.warn("Supabase getCoupons failed, falling back to localStorage:", err);
      return getLocal();
    }
  },

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const getLocal = () => {
      const local = localStorage.getItem('md_coupons');
      const list: Coupon[] = local ? JSON.parse(local) : [];
      return list.find(item => item.code.toUpperCase() === code.toUpperCase()) || null;
    };
    if (!isSupabaseConfigured) return getLocal();
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        code: data.code,
        type: data.type as 'percent' | 'fixed',
        value: Number(data.value),
        minOrder: Number(data.min_order || 0),
        active: Boolean(data.active),
        description: data.description || undefined
      };
    } catch (err) {
      console.warn("Supabase getCouponByCode failed, falling back to localStorage:", err);
      return getLocal();
    }
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    const local = localStorage.getItem('md_coupons');
    let list: Coupon[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex(item => item.code === coupon.code);
    if (idx !== -1) {
      list[idx] = coupon;
    } else {
      list.push(coupon);
    }
    localStorage.setItem('md_coupons', JSON.stringify(list));
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('coupons')
        .upsert({
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          min_order: coupon.minOrder,
          active: coupon.active,
          description: coupon.description || null
        });
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase saveCoupon failed, saved to localStorage only:", err);
    }
  },

  async deleteCoupon(code: string): Promise<void> {
    const local = localStorage.getItem('md_coupons');
    if (local) {
      let list: Coupon[] = JSON.parse(local);
      list = list.filter(item => item.code !== code);
      localStorage.setItem('md_coupons', JSON.stringify(list));
    }
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('code', code);
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase deleteCoupon failed, deleted from localStorage only:", err);
    }
  },

  async getSiteSettings(): Promise<SiteSettings> {
    const defaultSettings: SiteSettings = {
      whatsapp: '918448229528',
      supportPhone: '+918448229528',
      supportEmail: 'support@maadiaries.com',
      supportAddress: 'D-16, Part 1, Chanakya Place, 40 Feet Road, Opp. Gurudwara, New Delhi - 110059',
      freeShippingThreshold: 1000,
      seoTitle: 'Maa Diaries | Premium Anti-Tarnish Jewellery',
      seoDescription: 'Premium anti-tarnish jewellery and everyday elegance.',
      heroTitle: 'Anti-Tarnish Elegance',
      heroSubtitle: 'Premium Anti-Tarnish Jewellery',
      heroDescription: 'Beautifully crafted jewelry micro-plated with a tarnish-resistant polymer seal. Designed for daily wear, sweat, and showers.',
      heroImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
      homeNewArrivals: [],
      homeBestSellers: [],
      homeTrending: [],
      homeCategories: [],
      instagramFeedUrls: []
    };
    const getLocal = () => {
      const local = localStorage.getItem('md_site_settings');
      return local ? JSON.parse(local) : defaultSettings;
    };
    if (!isSupabaseConfigured) return getLocal();
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
      
      if (error) throw error;
      if (!data) {
        // Row does not exist, insert default
        await supabase.from('site_settings').insert({
          id: 'default',
          whatsapp: defaultSettings.whatsapp,
          support_phone: defaultSettings.supportPhone,
          support_email: defaultSettings.supportEmail,
          support_address: defaultSettings.supportAddress,
          free_shipping_threshold: defaultSettings.freeShippingThreshold,
          seo_title: defaultSettings.seoTitle,
          seo_description: defaultSettings.seoDescription,
          hero_title: defaultSettings.heroTitle,
          hero_subtitle: defaultSettings.heroSubtitle,
          hero_description: defaultSettings.heroDescription,
          hero_image: defaultSettings.heroImage,
          home_new_arrivals: [],
          home_best_sellers: [],
          home_trending: [],
          home_categories: [],
          instagram_feed_urls: []
        });
        return defaultSettings;
      }
      const settings: SiteSettings = {
        whatsapp: data.whatsapp || defaultSettings.whatsapp,
        supportPhone: data.support_phone || defaultSettings.supportPhone,
        supportEmail: data.support_email || defaultSettings.supportEmail,
        supportAddress: data.support_address || defaultSettings.supportAddress,
        freeShippingThreshold: Number(data.free_shipping_threshold ?? defaultSettings.freeShippingThreshold),
        seoTitle: data.seo_title || defaultSettings.seoTitle,
        seoDescription: data.seo_description || defaultSettings.seoDescription,
        heroTitle: data.hero_title || defaultSettings.heroTitle,
        heroSubtitle: data.hero_subtitle || defaultSettings.heroSubtitle,
        heroDescription: data.hero_description || defaultSettings.heroDescription,
        heroImage: data.hero_image || defaultSettings.heroImage,
        homeNewArrivals: Array.isArray(data.home_new_arrivals) ? data.home_new_arrivals : [],
        homeBestSellers: Array.isArray(data.home_best_sellers) ? data.home_best_sellers : [],
        homeTrending: Array.isArray(data.home_trending) ? data.home_trending : [],
        homeCategories: Array.isArray(data.home_categories) ? data.home_categories : [],
        instagramFeedUrls: Array.isArray(data.instagram_feed_urls) ? data.instagram_feed_urls : []
      };
      localStorage.setItem('md_site_settings', JSON.stringify(settings));
      return settings;
    } catch (err) {
      console.warn("Supabase getSiteSettings failed, falling back to localStorage:", err);
      return getLocal();
    }
  },

  async saveSiteSettings(settings: SiteSettings): Promise<void> {
    localStorage.setItem('md_site_settings', JSON.stringify(settings));
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'default',
          whatsapp: settings.whatsapp,
          support_phone: settings.supportPhone,
          support_email: settings.supportEmail,
          support_address: settings.supportAddress,
          free_shipping_threshold: settings.freeShippingThreshold,
          seo_title: settings.seoTitle,
          seo_description: settings.seoDescription,
          hero_title: settings.heroTitle,
          hero_subtitle: settings.heroSubtitle,
          hero_description: settings.heroDescription,
          hero_image: settings.heroImage,
          home_new_arrivals: settings.homeNewArrivals,
          home_best_sellers: settings.homeBestSellers,
          home_trending: settings.homeTrending,
          home_categories: settings.homeCategories,
          instagram_feed_urls: settings.instagramFeedUrls,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase saveSiteSettings failed, saved to localStorage only:", err);
    }
  },

  async getMedia(): Promise<{ id: string; url: string; name: string; createdAt: string; }[]> {
    const getLocal = () => {
      const local = localStorage.getItem('md_media');
      return local ? JSON.parse(local) : [];
    };
    if (!isSupabaseConfigured) return getLocal();
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (data || []).map((row: any) => ({
        id: String(row.id),
        url: row.url,
        name: row.name || 'Untitled Image',
        createdAt: row.created_at
      }));
      localStorage.setItem('md_media', JSON.stringify(list));
      return list;
    } catch (err) {
      console.warn("Supabase getMedia failed, falling back to localStorage:", err);
      return getLocal();
    }
  },

  async addMedia(url: string, name: string): Promise<{ id: string; url: string; name: string; createdAt: string; }> {
    const getLocal = () => {
      const local = localStorage.getItem('md_media');
      const list = local ? JSON.parse(local) : [];
      const newMedia = {
        id: 'local_' + Date.now(),
        url,
        name,
        createdAt: new Date().toISOString()
      };
      list.unshift(newMedia);
      localStorage.setItem('md_media', JSON.stringify(list));
      return newMedia;
    };
    if (!isSupabaseConfigured) return getLocal();
    try {
      const { data, error } = await supabase
        .from('media_library')
        .insert({ url, name })
        .select('*')
        .single();
      if (error) throw error;
      const newMedia = {
        id: String(data.id),
        url: data.url,
        name: data.name || 'Untitled Image',
        createdAt: data.created_at
      };
      const local = localStorage.getItem('md_media');
      const list = local ? JSON.parse(local) : [];
      list.unshift(newMedia);
      localStorage.setItem('md_media', JSON.stringify(list));
      return newMedia;
    } catch (err) {
      console.warn("Supabase addMedia failed, saved to localStorage only:", err);
      return getLocal();
    }
  },

  async deleteMedia(id: string): Promise<void> {
    const local = localStorage.getItem('md_media');
    if (local) {
      let list = JSON.parse(local);
      list = list.filter((item: any) => item.id !== id);
      localStorage.setItem('md_media', JSON.stringify(list));
    }
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase deleteMedia failed, deleted from localStorage only:", err);
    }
  },

  async getEmailLogs(): Promise<{ id: string; recipientEmail: string; subject: string; body: string; status: string; createdAt: string; }[]> {
    const getLocal = () => {
      const local = localStorage.getItem('md_email_logs');
      return local ? JSON.parse(local) : [];
    };
    if (!isSupabaseConfigured) return getLocal();
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (data || []).map((row: any) => ({
        id: String(row.id),
        recipientEmail: row.recipient_email,
        subject: row.subject,
        body: row.body,
        status: row.status,
        createdAt: row.created_at
      }));
      localStorage.setItem('md_email_logs', JSON.stringify(list));
      return list;
    } catch (err) {
      console.warn("Supabase getEmailLogs failed, falling back to localStorage:", err);
      return getLocal();
    }
  },

  async logEmailNotification(recipientEmail: string, subject: string, body: string, status: string = 'sent'): Promise<void> {
    const local = localStorage.getItem('md_email_logs');
    const list = local ? JSON.parse(local) : [];
    const newLog = {
      id: 'local_' + Date.now(),
      recipientEmail,
      subject,
      body,
      status,
      createdAt: new Date().toISOString()
    };
    list.unshift(newLog);
    localStorage.setItem('md_email_logs', JSON.stringify(list));
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('email_logs')
        .insert({
          recipient_email: recipientEmail,
          subject,
          body,
          status
        });
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase logEmailNotification failed, logged in localStorage only:", err);
    }
  }
};
