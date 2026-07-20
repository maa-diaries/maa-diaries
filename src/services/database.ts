import { INITIAL_PRODUCTS } from '../data/products';
import type { Product } from '../data/products';
import { supabase, isSupabaseConfigured } from './supabase';

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
  image: row.image || '',
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

export const databaseService = {
  // --- Products API ---
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      console.warn("Supabase is not configured. Returning default seeded products.");
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
    const id = `prod-${Math.random().toString(36).substr(2, 9)}`;
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
      console.warn("Supabase is not configured. Returning empty order list.");
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
    const id = `MD-${Math.floor(100000 + Math.random() * 900000)}`;
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
        created_at: createdAt
      });
    if (error) throw error;
    return newOrder;
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
      console.warn("Supabase is not configured. Returning empty inquiries.");
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
    const id = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;
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
      console.warn("Supabase is not configured. Returning empty registered users.");
      return [];
    }
    const { data, error } = await supabase
      .from('registered_users')
      .select('*');
    if (error) throw error;
    return (data || []).map((row: any) => ({
      name: row.name,
      email: row.email,
      phone: row.phone,
      addressLine: row.address_line,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      password: row.password
    }));
  },

  async registerUser(profile: any): Promise<boolean> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot register user.");
    }
    const users = await this.getUsers();
    const exists = users.some(u => 
      u.email.toLowerCase() === profile.email.toLowerCase() || 
      u.phone === profile.phone
    );
    if (exists) return false;

    const { error } = await supabase
      .from('registered_users')
      .insert({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address_line: profile.addressLine,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        password: profile.password
      });
    if (error) throw error;
    return true;
  },

  // --- Product Reviews API ---
  async getAllReviews(): Promise<ProductReview[]> {
    if (!isSupabaseConfigured) {
      console.warn("Supabase is not configured. Returning empty reviews list.");
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
      createdAt: row.created_at
    }));
  },

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    if (!isSupabaseConfigured) {
      console.warn("Supabase is not configured. Returning empty product reviews.");
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
      createdAt: row.created_at
    }));
  },

  async submitProductReview(reviewData: Omit<ProductReview, 'id' | 'createdAt'>): Promise<ProductReview> {
    const id = `rev-${Math.random().toString(36).substr(2, 9)}`;
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
    const productReviews = await this.getProductReviews(reviewData.productId);
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / productReviews.length).toFixed(1));

    const products = await this.getProducts();
    const pIndex = products.findIndex(p => p.id === reviewData.productId);
    if (pIndex !== -1) {
      products[pIndex].rating = avgRating;
      products[pIndex].reviewsCount = productReviews.length;
      await this.updateProduct(products[pIndex]);
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
    if (!isSupabaseConfigured) {
      console.warn("Supabase is not configured. Returning default categories list.");
      return defaultCategories;
    }
    const { data, error } = await supabase
      .from('categories')
      .select('name');
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((row: any) => row.name.toLowerCase());
    } else {
      // Seed default categories into Supabase if empty
      for (const cat of defaultCategories) {
        await supabase.from('categories').insert({ name: cat });
      }
      return defaultCategories;
    }
  },

  async addCategory(name: string): Promise<void> {
    const cleaned = name.trim().toLowerCase();
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot add category.");
    }
    const { error } = await supabase
      .from('categories')
      .insert({ name: cleaned });
    if (error) throw error;
  },

  async deleteCategory(name: string): Promise<void> {
    const cleaned = name.trim().toLowerCase();
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Cannot delete category.");
    }
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', cleaned);
    if (error) throw error;
  }
};
